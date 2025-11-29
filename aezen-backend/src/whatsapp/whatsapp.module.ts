import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppGateway } from './whatsapp.gateway';
import { Conversation } from '../chat/conversation.entity';
import { Message } from '../chat/message.entity';
import { AuthModule } from '../auth/auth.module';
import { KbIntegrationModule } from '../kb-integration/kb-integration.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, Message]),
        AuthModule,
        KbIntegrationModule,
    ],
    controllers: [WhatsAppController],
    providers: [WhatsAppService, WhatsAppGateway],
    exports: [WhatsAppService],
})
export class WhatsAppModule { }
