import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { KbIntegrationService } from '../kb-integration/kb-integration.service';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { TenantDbManagerService } from '../tenant/tenant-db-manager.service';

import { TicketService } from '../ticket/ticket.service';
import { AiTicketService } from '../ai-ticket/ai-ticket.service';

@Injectable()
export class ChatService {
    constructor(
        private tenantDbManager: TenantDbManagerService,
        private kbService: KbIntegrationService,
        private tenantConfigService: TenantConfigService,
        private ticketService: TicketService,
        private aiTicketService: AiTicketService,
    ) { }

    private async getRepositories(tenantId: string) {
        const dataSource = await this.tenantDbManager.getDataSource(tenantId);
        return {
            conversationRepo: dataSource.getRepository(Conversation),
            messageRepo: dataSource.getRepository(Message),
        };
    }

    async getConversations(tenantId: string) {
        const { conversationRepo } = await this.getRepositories(tenantId);
        return conversationRepo.find({
            order: { lastMessageAt: 'DESC' },
        });
    }

    async getConversation(tenantId: string, id: string) {
        const { conversationRepo } = await this.getRepositories(tenantId);
        const conversation = await conversationRepo.findOne({ where: { id } });
        if (!conversation) return null;

        const ticket = await this.ticketService.getTicketByConversationId(tenantId, id);
        return {
            ...conversation,
            ticketId: ticket?.id,
            ticketNumber: ticket?.ticketNumber,
        };
    }

    async getMessages(tenantId: string, conversationId: string) {
        const { messageRepo } = await this.getRepositories(tenantId);
        return messageRepo.find({
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'ASC' },
        });
    }

    async processMessage(tenantId: string, userId: string, messageContent: string): Promise<string> {
        const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

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

        // 4. Check for AI Ticket Triggers FIRST
        try {
            const aiTicket = await this.aiTicketService.checkAndCreateTicket(tenantId, userId, messageContent, conversation.id);
            if (aiTicket) {
                const replyText = "We have created a ticket for your request. Our agent will get back to you shortly.";

                // Save AI Response
                const aiMessage = messageRepo.create({
                    sender: 'ai',
                    content: replyText,
                    conversationId: conversation.id,
                    createdAt: new Date(),
                    type: 'text'
                });
                await messageRepo.save(aiMessage);

                // Update conversation
                conversation.lastMessage = replyText;
                conversation.lastMessageAt = new Date();
                await conversationRepo.save(conversation);

                return replyText;
            }
        } catch (err) {
            console.error('[ChatService] Error checking AI ticket:', err);
        }

        // 5. Call KB Service
        try {
            // Use tenantId directly as the identifier for KB
            const result = await this.kbService.queryBot(tenantId, userId, messageContent);
            const response = result.answer;

            if (!response || response === "Sorry, I'm having trouble connecting to my brain right now.") {
                console.warn('KB Service unavailable or empty response.');
                // Optionally return error message or silence
                // User requested to remove error message? "Member can still reply manually... auto-reply should not block"
                // If error, we just return empty string so no bot message is saved?
                // Let's return the error message if it's a connection error so user knows, or just silence it.
                // The previous code returned empty string on error.
                if (response === "Sorry, I'm having trouble connecting to my brain right now.") return '';
            }

            // 6. Save AI Response
            const aiMessage = messageRepo.create({
                sender: 'ai',
                content: response,
                // responseMetadata: metadata, // KB service doesn't return metadata yet in the same format
                conversationId: conversation.id,
                createdAt: new Date(),
                type: 'text'
            });
            await messageRepo.save(aiMessage);

            return response;
        } catch (error) {
            console.error('KB Service failed:', error);
            return '';
        }
    }

    async sendAgentMessage(tenantId: string, conversationId: string, content: string) {
        const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

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

    async markAsRead(tenantId: string, conversationId: string) {
        const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

        const conversation = await conversationRepo.findOne({ where: { id: conversationId } });
        if (!conversation) throw new Error('Conversation not found');

        conversation.unreadCount = 0;
        await conversationRepo.save(conversation);

        // Optionally mark all messages as read
        await messageRepo.update({ conversationId, isRead: false }, { isRead: true });

        return { success: true };
    }

    async markAllAsRead(tenantId: string) {
        const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

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
