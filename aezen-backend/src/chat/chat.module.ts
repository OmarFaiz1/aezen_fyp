import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { RAGService } from './rag.service';
import { WsJwtGuard } from './ws-jwt.guard';
import { TenantModule } from '../tenant/tenant.module';
import { TicketModule } from '../ticket/ticket.module';
import { ChatController } from './chat.controller';
import { KbIntegrationModule } from '../kb-integration/kb-integration.module';
import { AiTicketModule } from '../ai-ticket/ai-ticket.module';

@Global()
@Module({
    imports: [
        TenantModule,
        TicketModule,
        KbIntegrationModule,
        AiTicketModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'secret',
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, RAGService, WsJwtGuard],
    exports: [ChatService, ChatGateway],
})
export class ChatModule { }
