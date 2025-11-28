import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
    ) { }

    @Get()
    async getConversations(@Request() req) {
        return this.chatService.getConversations(req.user.tenantId);
    }

    @Get(':id')
    async getConversation(@Param('id') id: string, @Request() req) {
        return this.chatService.getConversation(req.user.tenantId, id);
    }

    @Get(':id/messages')
    async getMessages(@Param('id') id: string, @Request() req) {
        return this.chatService.getMessages(req.user.tenantId, id);
    }

    @Post(':id/send')
    async sendMessage(
        @Param('id') id: string,
        @Body('text') text: string,
        @Request() req: any
    ) {
        // This is for web chat reply.
        // For now, we reuse processMessage logic or create a new method in ChatService for agent replies.
        // Since processMessage is for USER messages triggering RAG, we need a separate method for AGENT replies.
        // But for now, let's assume this is a simple echo or we need to implement agent reply logic.
        // Wait, the user wants "member can also sent reply back to the user".
        // So this is an AGENT reply.

        // I need to add sendAgentMessage to ChatService.
        const message = await this.chatService.sendAgentMessage(req.user.tenantId, id, text);

        // Emit to the specific conversation (so the guest user sees it)
        this.chatGateway.emitToConversation(id, 'message:new', message);

        return message;
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        return this.chatService.markAsRead(req.user.tenantId, id);
    }

    @Post('read-all')
    async markAllAsRead(@Request() req) {
        return this.chatService.markAllAsRead(req.user.tenantId);
    }
}
