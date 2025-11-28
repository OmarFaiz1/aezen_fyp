import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    private instanceId = Math.random().toString(36).substring(7);

    constructor(private chatService: ChatService) {
        console.log(`[ChatGateway] Constructor called. Instance: ${this.instanceId}`);
    }

    afterInit(server: Server) {
        console.log(`[ChatGateway] Initialized. Instance: ${this.instanceId}`);
        this.server = server;
    }

    handleConnection(client: Socket) {
        console.log(`[ChatGateway] Client connected: ${client.id}. Instance: ${this.instanceId}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[ChatGateway] Client disconnected: ${client.id}. Instance: ${this.instanceId}`);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('join')
    async handleJoin(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        if (user) {
            if (user.role === 'guest') {
                const room = `conversation:${user.sub}`;
                await client.join(room);
                console.log(`[ChatGateway] Guest ${user.name} joined room ${room}. Instance: ${this.instanceId}`);
            } else {
                const room = `tenant:${user.tenantId}`;
                await client.join(room);
                console.log(`[ChatGateway] Agent ${user.name} joined room ${room}. Instance: ${this.instanceId}`);
            }
        }
    }

    emitToConversation(conversationId: string, event: string, data: any) {
        if (!this.server) {
            console.error(`[ChatGateway] Server not initialized! Instance: ${this.instanceId}`);
            return;
        }
        const room = `conversation:${conversationId}`;
        console.log(`[ChatGateway] Emitting to room: ${room}, Event: ${event}, Instance: ${this.instanceId}`);
        this.server.to(room).emit(event, data);
    }

    emitToTenant(tenantId: string, event: string, data: any) {
        if (!this.server) {
            console.error(`[ChatGateway] Server not initialized! Instance: ${this.instanceId}`);
            return;
        }
        this.server.to(`tenant:${tenantId}`).emit(event, data);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('chat')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { message: string },
    ): Promise<void> {
        const user = client.data.user;
        if (!user) {
            client.emit('error', 'Unauthorized');
            return;
        }

        try {
            // If guest, send to WebChatService? Or ChatService?
            // ChatService.processMessage expects userId.
            // If user is guest, user.sub should be the userId (email).
            // But in GuestStrategy I mapped sub to conversationId?
            // Let's fix GuestStrategy to map sub to conversationId, and add userId field.

            // For now, let's assume user.email is the userId for guests.
            const userId = user.role === 'guest' ? user.email : user.sub;

            const response = await this.chatService.processMessage(
                user.tenantId,
                userId,
                payload.message,
            );

            // Emit back to sender (AI response)
            client.emit('chat_response', { message: response });

            // Also emit to tenant agents so they see the new message
            // We need to construct the message object to send to agents
            // Ideally ChatService returns the message object, not just string.
            // But processMessage returns string (AI response).
            // We should update processMessage to return the message object or emit events itself.

            this.emitToTenant(user.tenantId, 'chat:updated', { conversationId: user.role === 'guest' ? user.sub : undefined });

        } catch (error) {
            console.error('Error processing message:', error);
            client.emit('error', 'Internal Server Error');
        }
    }
}
