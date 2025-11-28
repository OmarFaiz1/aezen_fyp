import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('WhatsAppGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Accepts either { tenantId: string } or plain string tenantId
     * Joins the client to a namespaced room `tenant:<tenantId>` to avoid collisions.
     */
    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ) {
        // Accept both: socket.emit('joinRoom', 'tenantId') or socket.emit('joinRoom', { tenantId })
        let tenantId: string | undefined;

        if (!data) {
            this.logger.warn(`handleJoinRoom called without payload from client ${client.id}`);
            return { event: 'error', message: 'missing tenantId' };
        }

        if (typeof data === 'string') tenantId = data;
        else tenantId = data.tenantId || data.room || undefined;

        if (!tenantId) {
            this.logger.warn(`No tenantId resolved from payload for client ${client.id}: ${JSON.stringify(data)}`);
            return { event: 'error', message: 'invalid tenantId' };
        }

        const room = `tenant:${tenantId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room: ${room}`);
        return { event: 'joined', room };
    }

    /**
     * Emitters — all emit using the namespaced room `tenant:<tenantId>`
     * QR payload is emitted as an object so frontend can handle both raw/base64 and dataUri forms.
     */
    emitQr(tenantId: string, payload: string | Record<string, any>) {
        try {
            const room = `tenant:${tenantId}`;
            const data = typeof payload === 'string' ? { qr: payload } : payload;
            this.logger.log(`Emitting QR for tenant ${tenantId} → room=${room} keys=${Object.keys(data).join(',')}`);
            this.server.to(room).emit('qr', data);
        } catch (err) {
            this.logger.error('Error emitting QR', err);
        }
    }

    emitReady(tenantId: string) {
        try {
            const room = `tenant:${tenantId}`;
            this.logger.log(`Emitting Ready for tenant ${tenantId} → room=tenant:${tenantId}`);
            this.server.to(room).emit('whatsapp_connected', { status: 'connected' });
        } catch (err) {
            this.logger.error('Error emitting ready', err);
        }
    }

    emitMessage(tenantId: string, message: any) {
        try {
            const room = `tenant:${tenantId}`;
            this.logger.log(`Emitting Message for tenant ${tenantId} → room=${room}`);
            this.server.to(room).emit('incoming_message', message);
        } catch (err) {
            this.logger.error('Error emitting message', err);
        }
    }

    emitStatusChange(tenantId: string, status: string) {
        try {
            const room = `tenant:${tenantId}`;
            this.logger.log(`Emitting Status Change for tenant ${tenantId}: ${status}`);
            this.server.to(room).emit('status_change', { status });
        } catch (err) {
            this.logger.error('Error emitting status change', err);
        }
    }

    emitMemberMessage(tenantId: string, message: any) {
        try {
            const room = `tenant:${tenantId}`;
            this.logger.log(`Emitting Member Message for tenant ${tenantId} → room=${room}`);
            this.server.to(room).emit('member_sent_message', message);
        } catch (err) {
            this.logger.error('Error emitting member message', err);
        }
    }
}