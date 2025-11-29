import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../users/user.entity';
import { AiTicketTrigger } from '../ai-ticket/ai-ticket-trigger.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('MASTER_DB_HOST', 'localhost'),
                port: configService.get<number>('MASTER_DB_PORT', 5432),
                username: configService.get<string>('MASTER_DB_USER', 'postgres'),
                password: configService.get<string>('MASTER_DB_PASS', 'fastians'),
                database: configService.get<string>('MASTER_DB_NAME', 'aezen_master'),
                entities: [Tenant, User, AiTicketTrigger],
                synchronize: true, // Note: Disable in production
            }),
        }),
    ],
})
export class DatabaseModule { }
