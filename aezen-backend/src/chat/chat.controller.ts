import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    async getConversations() {
        return this.chatService.getConversations();
    }

    @Get(':id')
    async getConversation(@Param('id') id: string) {
        return this.chatService.getConversation(id);
    }

    @Get(':id/messages')
    async getMessages(@Param('id') id: string) {
        return this.chatService.getMessages(id);
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
        return this.chatService.sendAgentMessage(id, text);
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.chatService.markAsRead(id);
    }

    @Post('read-all')
    async markAllAsRead() {
        return this.chatService.markAllAsRead();
    }
}
