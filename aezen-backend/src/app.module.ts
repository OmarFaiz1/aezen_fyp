import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantModule } from './tenant/tenant.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { TeamModule } from './team/team.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { TicketModule } from './ticket/ticket.module';
import { WebChatModule } from './webchat/webchat.module';
import { KbIntegrationModule } from './kb-integration/kb-integration.module';
import { AiTicketModule } from './ai-ticket/ai-ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TenantModule,
    ChatModule,
    AdminModule,
    TeamModule,
    WhatsAppModule,
    TicketModule,
    WebChatModule,
    WebChatModule,
    KbIntegrationModule,
    AiTicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
