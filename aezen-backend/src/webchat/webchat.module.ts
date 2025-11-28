import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebChatController } from './webchat.controller';
import { WebChatService } from './webchat.service';
import { GuestJwtStrategy } from './guest-jwt.strategy';
import { TenantModule } from '../tenant/tenant.module';
import { ChatModule } from '../chat/chat.module';

@Module({
    imports: [
        TenantModule,
        ChatModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'secret',
                signOptions: { expiresIn: '30d' }, // Long expiration for guest sessions
            }),
        }),
    ],
    controllers: [WebChatController],
    providers: [WebChatService, GuestJwtStrategy],
})
export class WebChatModule { }
