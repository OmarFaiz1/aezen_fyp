import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { WhatsAppGateway } from './whatsapp.gateway';
import { Conversation } from '../chat/conversation.entity';
import { Message } from '../chat/message.entity';
import { SendImageDto } from './dtos/send-image.dto';
import { TenantConnectionManager } from '../tenant/tenant-connection.manager';

// Baileys imports
import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    WASocket,
    WAMessage,
    WAMessageKey,
    AnyMessageContent,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import * as qrcode from 'qrcode';

type TenantClient = {
    sock: WASocket;
    ready: boolean;
    saveCreds?: () => Promise<void>;
};

@Injectable()
export class WhatsAppService implements OnModuleInit {
    private clients: Map<string, TenantClient> = new Map();
    private logger = new Logger('WhatsAppService');
    private readonly SESSIONS_DIR = path.resolve('.', 'sessions');
    // guard to avoid infinite auto-reset loops
    private resetAttempts: Map<string, number> = new Map();
    private readonly MAX_AUTO_RESET = 1; // only auto-reset once per process lifetime per tenant

    constructor(
        private readonly gateway: WhatsAppGateway,
        private readonly connectionManager: TenantConnectionManager,
    ) { }

    async onModuleInit() {
        this.ensureSessionsDir();
        this.logger.log(`Sessions root: ${this.SESSIONS_DIR}`);

        // Auto-connect existing sessions
        try {
            const entries = fs.readdirSync(this.SESSIONS_DIR, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const tenantId = entry.name;
                    this.logger.log(`Found existing session for tenant ${tenantId}, initializing...`);
                    // Initialize without awaiting to allow parallel startup
                    this.initializeSession(tenantId).catch(err =>
                        this.logger.error(`Failed to auto-connect tenant ${tenantId}`, err)
                    );
                }
            }
        } catch (err) {
            this.logger.error('Failed to scan sessions directory for auto-connection', err);
        }
    }

    private ensureSessionsDir() {
        if (!fs.existsSync(this.SESSIONS_DIR)) {
            fs.mkdirSync(this.SESSIONS_DIR, { recursive: true });
        }
    }

    // Helper to get repositories for a specific tenant
    private async getRepositories(tenantId: string) {
        const dataSource = await this.connectionManager.getTenantConnection(tenantId);
        return {
            conversationRepo: dataSource.getRepository(Conversation),
            messageRepo: dataSource.getRepository(Message),
        };
    }

    // Initialize a Baileys session for a tenant
    async initializeSession(tenantId: string) {
        // Avoid double initialization
        if (this.clients.has(tenantId)) {
            this.logger.log(`Session for tenant ${tenantId} already exists — skipping initialize.`);
            return;
        }

        this.logger.log(`[WhatsAppService] Initializing Baileys session for tenant: ${tenantId} `);
        const sessionPath = path.join(this.SESSIONS_DIR, tenantId);
        this.logger.log(`[WhatsAppService] Session path: ${sessionPath} `);

        try {
            // Ensure folder exists for auth state
            if (!fs.existsSync(sessionPath)) {
                fs.mkdirSync(sessionPath, { recursive: true });
            }

            // Create Baileys auth state stored per-tenant
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

            // Create socket
            const sock = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false,
                browser: ['MyApp', 'Desktop', '1.0.0'],
            });

            // store client object
            this.clients.set(tenantId, { sock, ready: false, saveCreds });

            // wire up events
            this.setupEvents(sock, tenantId);

            // persist creds when they change
            try {
                sock.ev.on('creds.update', async () => {
                    try {
                        await saveCreds();
                    } catch (err) {
                        this.logger.error(`[whatsapp][tenant = ${tenantId}] Error saving creds`, err);
                    }
                });
            } catch (err) {
                this.logger.warn(`[whatsapp][tenant = ${tenantId}] Failed to attach creds.update listener`, err);
            }

            this.logger.log(`[WhatsAppService] Baileys socket created for ${tenantId}`);
        } catch (err) {
            this.logger.error(`[WhatsAppService] Failed to initialize session for ${tenantId}`, err);
            this.gateway.emitStatusChange(tenantId, 'error');
        }
    }

    private setupEvents(sock: WASocket, tenantId: string) {
        // connection/update contains QR, connection status, etc.
        sock.ev.on('connection.update', async (update: any) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                try {
                    this.logger.log(`[whatsapp][tenant = ${tenantId}] QR received(raw text)`);
                    const dataUri = await qrcode.toDataURL(qr);
                    this.logger.log(`[whatsapp][tenant = ${tenantId}] QR converted → emitting to frontend`);
                    // emit to frontend (gateway will send to room)
                    this.gateway.emitQr(tenantId, { qr, dataUri, timestamp: Date.now() });
                } catch (err) {
                    this.logger.error(`[whatsapp][tenant = ${tenantId}] Failed to generate QR image`, err);
                }
            }

            if (connection === 'open') {
                this.logger.log(`[whatsapp][tenant = ${tenantId}] Connection OPEN`);
                const clientObj = this.clients.get(tenantId);
                if (clientObj) clientObj.ready = true;
                this.resetAttempts.set(tenantId, 0); // reset auto-reset attempts after success
                this.gateway.emitReady(tenantId);
                this.gateway.emitStatusChange(tenantId, 'connected');
                // emit both generic and specific events for frontends that listen to either
                this.gateway.server.to(`tenant:${tenantId} `).emit('whatsapp_connected');
            }

            if (connection === 'close') {
                this.logger.warn(`[whatsapp][tenant = ${tenantId}] Connection closed`);
                this.gateway.emitStatusChange(tenantId, 'disconnected');

                // inspect lastDisconnect
                const statusCode = (lastDisconnect?.error as any)?.output?.statusCode || (lastDisconnect?.error as any)?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                this.logger.warn(`[whatsapp][tenant = ${tenantId}] lastDisconnect code: ${statusCode}, shouldReconnect: ${shouldReconnect} `);

                // clean up the in-memory client
                await this.cleanupClient(tenantId);

                if (shouldReconnect) {
                    this.logger.log(`[whatsapp][tenant = ${tenantId}] Reconnecting...`);
                    // Add a small delay to avoid tight loops
                    setTimeout(() => this.initializeSession(tenantId), 2000);
                } else {
                    this.logger.warn(`[whatsapp][tenant = ${tenantId}] Connection logged out(401).Checking auto - reset...`);

                    const attempts = this.resetAttempts.get(tenantId) || 0;
                    if (attempts < this.MAX_AUTO_RESET) {
                        this.resetAttempts.set(tenantId, attempts + 1);
                        this.logger.log(`[whatsapp][tenant = ${tenantId}] Scheduling automatic session reset(attempt ${attempts + 1}) to generate new QR`);

                        setTimeout(async () => {
                            try {
                                await this.resetSession(tenantId);
                            } catch (err) {
                                this.logger.error(`[whatsapp][tenant = ${tenantId}]Auto - reset failed`, err);
                            }
                        }, 1000);
                    } else {
                        this.logger.warn(`[whatsapp][tenant = ${tenantId}] Max auto - reset attempts reached.Manual reconfigure required.`);
                        this.gateway.emitStatusChange(tenantId, 'unauthorized');
                    }
                }
            }
        });

        // incoming messages
        sock.ev.on('messages.upsert', async (m) => {
            try {
                const messages = (m as any).messages || [];
                for (const msg of messages) {
                    // ignore system/own messages
                    if (msg.key && msg.key.fromMe) continue;
                    await this.handleIncomingMessage(tenantId, msg as WAMessage);
                }
            } catch (err) {
                this.logger.error(`[whatsapp][tenant = ${tenantId}]Error in messages.upsert handler`, err);
            }
        });

        // other event hooks (optional)
        sock.ev.on('presence.update', (p) => { /* optional */ });
        sock.ev.on('chats.update', (c) => { /* optional */ });
    }

    private isUnauthorizedDisconnect(lastDisconnect: any) {
        try {
            // Baileys shapes vary across versions, check these common fields
            if (!lastDisconnect) return false;
            // 1) HTTP-like output statusCode
            const statusCode =
                lastDisconnect?.error?.output?.statusCode ||
                lastDisconnect?.error?.statusCode ||
                lastDisconnect?.status;
            if (Number(statusCode) === 401) return true;

            // 2) some libs embed data.reason === '401'
            if (lastDisconnect?.error?.data?.reason === '401') return true;

            // 3) some libs provide a string
            const errMsg = JSON.stringify(lastDisconnect?.error || lastDisconnect || '');
            if (errMsg?.includes?.('"reason":"401"') || errMsg?.includes('Unauthorized')) return true;

            return false;
        } catch (err) {
            this.logger.warn('Failed to determine unauthorized state from lastDisconnect', err);
            return false;
        }
    }

    private async cleanupClient(tenantId: string) {
        const clientObj = this.clients.get(tenantId);
        if (!clientObj) return;
        try {
            // Try graceful logout
            try {
                await clientObj.sock.logout();
            } catch (e) {
                // logout may fail if connection is already closed
            }
        } catch (err) {
            // ignore
        }
        // remove from map
        this.clients.delete(tenantId);
    }

    private async handleIncomingMessage(tenantId: string, msg: WAMessage) {
        try {
            const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

            const key: WAMessageKey = msg.key as any;
            const jid = key.remoteJid || '';
            const contactNumber = jid.split('@')[0];

            // Extract content
            let content = '[Unsupported]';
            let type: 'text' | 'image' | 'other' = 'other';

            const message = msg.message as any;
            if (!message) return;

            if (message.conversation) {
                content = message.conversation;
                type = 'text';
            } else if (message.extendedTextMessage && message.extendedTextMessage.text) {
                content = message.extendedTextMessage.text;
                type = 'text';
            } else if (message.imageMessage) {
                type = 'image';
                content = message.imageMessage.caption || '[Image]';
            } else if (message.videoMessage) {
                type = 'other';
                content = message.videoMessage.caption || '[Video]';
            }

            const contactName = (message?.pushName) || contactNumber;

            this.logger.log(`[whatsapp][tenant=${tenantId}] incoming ${contactNumber} -> "${content}"`);

            // Find or create conversation
            let conversation = await conversationRepo.findOne({
                where: { tenantId, contactNumber, platform: 'whatsapp' },
            });

            if (!conversation) {
                conversation = conversationRepo.create({
                    tenantId,
                    contactNumber,
                    contactName,
                    platform: 'whatsapp',
                    userId: 'guest',
                    startedAt: new Date(),
                    unreadCount: 0,
                });
                await conversationRepo.save(conversation);
            }

            conversation.lastMessage = content;
            conversation.lastMessageAt = new Date();
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            await conversationRepo.save(conversation);

            const messageEntity = messageRepo.create({
                conversationId: conversation.id,
                sender: 'user',
                content: type === 'image' ? '[Image]' : content,
                type: type === 'text' ? 'text' : (type === 'image' ? 'image' : 'text'),
                createdAt: new Date(),
                isRead: false,
            });

            await messageRepo.save(messageEntity);

            this.gateway.emitMessage(tenantId, {
                ...messageEntity,
                conversationId: conversation.id,
                contactName,
                contactNumber,
            });
        } catch (error) {
            this.logger.error(`Error handling incoming message for tenant ${tenantId}`, error);
        }
    }

    async getStatus(tenantId: string) {
        const clientObj = this.clients.get(tenantId);
        const sessionPath = path.join(this.SESSIONS_DIR, tenantId);
        const sessionExists = fs.existsSync(sessionPath);

        if (!clientObj) {
            return { status: sessionExists ? 'disconnected' : 'inactive', connected: false, initialized: sessionExists };
        }

        try {
            const connected = clientObj.ready === true;
            return {
                status: connected ? 'connected' : 'connecting',
                connected,
                initialized: true,
            };
        } catch (err) {
            return { status: 'connecting', connected: false, initialized: true };
        }
    }

    async resetSession(tenantId: string) {
        this.logger.log(`Resetting session for tenant ${tenantId}`);

        // cleanup in-memory client if any
        const clientObj = this.clients.get(tenantId);
        if (clientObj) {
            try {
                await clientObj.sock.logout();
            } catch (e) { /* best effort */ }
            this.clients.delete(tenantId);
        }

        // delete session folder
        const sessionPath = path.join(this.SESSIONS_DIR, tenantId);
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                this.logger.log(`[whatsapp][tenant=${tenantId}] Deleted session folder: ${sessionPath}`);
            } catch (err) {
                this.logger.error(`[whatsapp][tenant=${tenantId}] Failed to delete session folder: ${sessionPath}`, err);
            }
        }

        // re-init (this will emit QR once Baileys sends it)
        await this.initializeSession(tenantId);
        return { success: true };
    }

    async disconnect(tenantId: string) {
        const clientObj = this.clients.get(tenantId);
        if (clientObj) {
            try {
                await clientObj.sock.logout();
            } catch (e) {
                // ignore
            }
            this.clients.delete(tenantId);
        }
        return { success: true };
    }

    async sendMessage(tenantId: string, conversationId: string, content: string) {
        const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

        const clientObj = this.clients.get(tenantId);
        if (!clientObj) throw new Error('WhatsApp client not connected');

        const conversation = await conversationRepo.findOne({ where: { id: conversationId } });
        if (!conversation || !conversation.contactNumber) throw new Error('Conversation not found');

        const jid = `${conversation.contactNumber}@s.whatsapp.net`;

        await clientObj.sock.sendMessage(jid, { text: content } as AnyMessageContent);

        const message = messageRepo.create({
            conversationId,
            sender: 'agent',
            content,
            type: 'text',
            createdAt: new Date(),
            isRead: true,
        });
        await messageRepo.save(message);

        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversationRepo.save(conversation);

        this.gateway.emitMemberMessage(tenantId, message);
        this.logger.log(`[whatsapp][tenant=${tenantId}] sent → ${content}`);
        return message;
    }

    async sendImage(tenantId: string, dto: SendImageDto) {
        const { conversationRepo, messageRepo } = await this.getRepositories(tenantId);

        const clientObj = this.clients.get(tenantId);
        if (!clientObj) throw new Error('WhatsApp client not connected');

        const conversation = await conversationRepo.findOne({ where: { id: dto.conversationId } });
        if (!conversation || !conversation.contactNumber) throw new Error('Conversation not found');

        const jid = `${conversation.contactNumber}@s.whatsapp.net`;

        let imageBuffer: Buffer | undefined;
        if ((dto as any).filePath && fs.existsSync((dto as any).filePath)) {
            imageBuffer = fs.readFileSync((dto as any).filePath);
        } else if ((dto as any).base64) {
            imageBuffer = Buffer.from((dto as any).base64, 'base64');
        }

        if (!imageBuffer) throw new Error('No image provided');

        await clientObj.sock.sendMessage(jid, { image: imageBuffer, caption: dto.caption || '' });

        const message = messageRepo.create({
            conversationId: dto.conversationId,
            sender: 'agent',
            content: dto.caption || '[Image]',
            type: 'image',
            createdAt: new Date(),
            isRead: true,
        });
        await messageRepo.save(message);

        conversation.lastMessage = dto.caption || '[Image]';
        conversation.lastMessageAt = new Date();
        await conversationRepo.save(conversation);

        this.gateway.emitMemberMessage(tenantId, message);
        this.logger.log(`[whatsapp][tenant=${tenantId}] sent image → ${dto.caption || '[Image]'}`);
        return message;
    }
}