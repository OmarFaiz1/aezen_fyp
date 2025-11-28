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

@Global()
@Module({
    imports: [
        TenantModule,
        TicketModule,
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
