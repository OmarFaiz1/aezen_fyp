import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Request, Delete } from '@nestjs/common';
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
    }, @Request() req) {
        return this.ticketService.createTicket(req.user.tenantId, req.user.userId, createTicketDto);
    }

    @Get()
    findAll(
        @Query('status') status?: TicketStatus,
        @Query('priority') priority?: TicketPriority,
        @Query('search') search?: string,
        @Query('assignedByType') assignedByType?: 'ai' | 'human' | 'all',
        @Request() req?: any
    ) {
        console.log('[TicketController] GET /tickets called');
        return this.ticketService.getTickets(req.user.tenantId, { status, priority, search, assignedByType });
    }

    @Get('my')
    findMyTickets(
        @Query('status') status?: TicketStatus,
        @Query('priority') priority?: TicketPriority,
        @Query('search') search?: string,
        @Query('assignedByType') assignedByType?: 'ai' | 'human' | 'all',
        @Request() req?: any
    ) {
        console.log('[TicketController] GET /tickets/my called');
        return this.ticketService.getMyTickets(req.user.tenantId, req.user.userId, { status, priority, search, assignedByType });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.ticketService.getTicket(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTicketDto: any, @Request() req) {
        return this.ticketService.updateTicket(req.user.tenantId, id, updateTicketDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.ticketService.deleteTicket(req.user.tenantId, id);
    }
}
