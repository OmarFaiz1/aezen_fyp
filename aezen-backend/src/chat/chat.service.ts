import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Repository } from 'typeorm';
import { RAGService } from './rag.service';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { TenantDbManagerService } from '../tenant/tenant-db-manager.service';

import { TicketService } from '../ticket/ticket.service';

@Injectable({ scope: Scope.REQUEST })
export class ChatService {
    constructor(
        @Inject(REQUEST) private request: any,
        private tenantDbManager: TenantDbManagerService,
        private ragService: RAGService,
        private tenantConfigService: TenantConfigService,
        private ticketService: TicketService,
    ) { }

    private async getRepositories() {
        const dataSource = await this.tenantDbManager.getDataSource();
        return {
            conversationRepo: dataSource.getRepository(Conversation),
            messageRepo: dataSource.getRepository(Message),
        };
    }

    async getConversations() {
        const { conversationRepo } = await this.getRepositories();
        return conversationRepo.find({
            order: { lastMessageAt: 'DESC' },
        });
    }

    async getConversation(id: string) {
        const { conversationRepo } = await this.getRepositories();
        const conversation = await conversationRepo.findOne({ where: { id } });
        if (!conversation) return null;

        const ticket = await this.ticketService.getTicketByConversationId(id);
        return {
            ...conversation,
            ticketId: ticket?.id,
            ticketNumber: ticket?.ticketNumber,
        };
    }

    async getMessages(conversationId: string) {
        const { messageRepo } = await this.getRepositories();
        return messageRepo.find({
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'ASC' },
        });
    }

    async processMessage(tenantId: string, userId: string, messageContent: string): Promise<string> {
        const { conversationRepo, messageRepo } = await this.getRepositories();

        // 1. Get Tenant Config for kbPointer
        const tenant = await this.tenantConfigService.getDbConfig(tenantId);
        if (!tenant) {
            throw new Error('Tenant not found');
        }

        // 2. Find or Create Conversation
        let conversation = await conversationRepo.findOne({
            where: { userId },
            order: { startedAt: 'DESC' },
        });

        if (!conversation) {
            conversation = conversationRepo.create({
                userId,
                startedAt: new Date(),
                platform: 'web', // Default to web for this flow
                tenantId
            });
            await conversationRepo.save(conversation);
        }

        // 3. Save User Message
        const userMessage = messageRepo.create({
            sender: 'user',
            content: messageContent,
            conversationId: conversation.id,
            createdAt: new Date(),
            type: 'text'
        });
        await messageRepo.save(userMessage);

        // Update conversation
        conversation.lastMessageAt = new Date();
        conversation.lastMessage = messageContent;
        await conversationRepo.save(conversation);

        // 4. Call RAG Service
        const { response, metadata } = await this.ragService.queryFastAPI(messageContent, tenant.kbPointer);

        // 5. Save AI Response
        const aiMessage = messageRepo.create({
            sender: 'ai',
            content: response,
            responseMetadata: metadata,
            conversationId: conversation.id,
            createdAt: new Date(),
            type: 'text'
        });
        await messageRepo.save(aiMessage);

        return response;
    }

    async sendAgentMessage(conversationId: string, content: string) {
        const { conversationRepo, messageRepo } = await this.getRepositories();

        const conversation = await conversationRepo.findOne({ where: { id: conversationId } });
        if (!conversation) throw new Error('Conversation not found');

        const message = messageRepo.create({
            conversationId,
            sender: 'agent',
            content,
            type: 'text',
            createdAt: new Date(),
            isRead: true
        });
        await messageRepo.save(message);

        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversationRepo.save(conversation);

        return message;
    }

    async markAsRead(conversationId: string) {
        const { conversationRepo, messageRepo } = await this.getRepositories();

        const conversation = await conversationRepo.findOne({ where: { id: conversationId } });
        if (!conversation) throw new Error('Conversation not found');

        conversation.unreadCount = 0;
        await conversationRepo.save(conversation);

        // Optionally mark all messages as read
        await messageRepo.update({ conversationId, isRead: false }, { isRead: true });

        return { success: true };
    }

    async markAllAsRead() {
        const { conversationRepo, messageRepo } = await this.getRepositories();

        // Update all conversations to have 0 unread count
        await conversationRepo.createQueryBuilder()
            .update(Conversation)
            .set({ unreadCount: 0 })
            .execute();

        // Mark all messages as read
        await messageRepo.createQueryBuilder()
            .update(Message)
            .set({ isRead: true })
            .where("isRead = :isRead", { isRead: false })
            .execute();

        return { success: true };
    }
}
