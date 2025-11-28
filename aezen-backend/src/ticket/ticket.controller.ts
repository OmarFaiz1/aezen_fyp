import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketPriority, TicketStatus } from './ticket.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @Post()
    create(@Body() createTicketDto: {
        title: string;
        description?: string;
        priority: TicketPriority;
        status: TicketStatus;
        conversationId?: string;
        assignedToId?: string;
    }) {
        return this.ticketService.createTicket(createTicketDto);
    }

    @Get()
    findAll(
        @Query('status') status?: TicketStatus,
        @Query('priority') priority?: TicketPriority,
        @Query('search') search?: string,
    ) {
        console.log('[TicketController] GET /tickets called');
        return this.ticketService.getTickets({ status, priority, search });
    }

    @Get('my')
    findMyTickets(
        @Query('status') status?: TicketStatus,
        @Query('priority') priority?: TicketPriority,
        @Query('search') search?: string,
    ) {
        console.log('[TicketController] GET /tickets/my called');
        return this.ticketService.getMyTickets({ status, priority, search });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketService.getTicket(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTicketDto: any) {
        return this.ticketService.updateTicket(id, updateTicketDto);
    }
}
