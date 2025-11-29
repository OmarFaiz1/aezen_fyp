import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTicketTrigger } from './ai-ticket-trigger.entity';
import { AiTicketService } from './ai-ticket.service';
import { AiTicketController } from './ai-ticket.controller';
import { TicketModule } from '../ticket/ticket.module';
import { TeamModule } from '../team/team.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AiTicketTrigger]),
        TicketModule,
        TeamModule,
    ],
    controllers: [AiTicketController],
    providers: [AiTicketService],
    exports: [AiTicketService],
})
export class AiTicketModule { }
