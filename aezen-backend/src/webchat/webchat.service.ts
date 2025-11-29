import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantDbManagerService } from '../tenant/tenant-db-manager.service';
import { Conversation } from '../chat/conversation.entity';
import { Message } from '../chat/message.entity';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';
import { TenantConfigService } from '../tenant/tenant-config.service';

@Injectable()
export class WebChatService {
    constructor(
        private jwtService: JwtService,
        private tenantDbManager: TenantDbManagerService,
        private chatService: ChatService,
        private chatGateway: ChatGateway,
        private tenantConfigService: TenantConfigService,
    ) { }

    async getTenantName(tenantId: string) {
        const tenant = await this.tenantConfigService.getDbConfig(tenantId);
        return tenant ? tenant.name : 'Unknown Tenant';
    }

    private async getRepositories(tenantId: string) {
        const dataSource = await this.tenantDbManager.getDataSource(tenantId);
        return {
            conversationRepo: dataSource.getRepository(Conversation),
            messageRepo: dataSource.getRepository(Message),
        };
    }

    async identify(tenantId: string, name: string, email: string) {
        const { conversationRepo } = await this.getRepositories(tenantId);

        // Find or create conversation
        let conversation = await conversationRepo.findOne({
            where: { userId: email },
        });

        if (!conversation) {
            conversation = conversationRepo.create({
                userId: email,
                contactName: name,
                contactNumber: email,
                platform: 'web',
                tenantId,
                startedAt: new Date(),
            });
            await conversationRepo.save(conversation);
        } else {
            // Update name if changed
            if (conversation.contactName !== name) {
                conversation.contactName = name;
                await conversationRepo.save(conversation);
            }
        }

        // Generate Guest Token
        const payload = { email, name, tenantId, sub: conversation.id, role: 'guest' };
        return {
            accessToken: this.jwtService.sign(payload),
            conversationId: conversation.id,
        };
    }

    async getMessages(tenantId: string, conversationId: string) {
        const { messageRepo } = await this.getRepositories(tenantId);
        return messageRepo.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
        });
    }

    async sendMessage(tenantId: string, conversationId: string, content: string, email: string) {
        const response = await this.chatService.processMessage(tenantId, email, content);

        // Emit to tenant agents
        this.chatGateway.emitToTenant(tenantId, 'chat:updated', { conversationId });
        this.chatGateway.emitToTenant(tenantId, 'message:new', {
            conversationId,
            content,
            sender: 'user',
            createdAt: new Date()
        });

        // Emit Bot Reply to User (Real-time)
        this.chatGateway.emitToConversation(conversationId, 'chat_response', { message: response });

        return { message: response };
    }
}
