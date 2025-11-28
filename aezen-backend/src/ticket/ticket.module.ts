import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TenantModule } from '../tenant/tenant.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TenantModule, UsersModule],
    controllers: [TicketController],
    providers: [TicketService],
    exports: [TicketService],
})
export class TicketModule { }
