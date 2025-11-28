import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private chatService: ChatService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
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
            const response = await this.chatService.processMessage(
                user.tenantId,
                user.sub, // userId
                payload.message,
            );
            client.emit('chat_response', { message: response });
        } catch (error) {
            console.error('Error processing message:', error);
            client.emit('error', 'Internal Server Error');
        }
    }
}
