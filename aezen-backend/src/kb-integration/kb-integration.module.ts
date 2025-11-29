import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KbIntegrationService } from './kb-integration.service';
import { KbIntegrationController } from './kb-integration.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
    ],
    providers: [KbIntegrationService],
    controllers: [KbIntegrationController],
    exports: [KbIntegrationService],
})
export class KbIntegrationModule { }
