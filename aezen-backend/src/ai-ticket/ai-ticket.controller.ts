import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AiTicketService } from './ai-ticket.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai-tickets')
@UseGuards(JwtAuthGuard)
export class AiTicketController {
    constructor(private readonly aiTicketService: AiTicketService) { }

    @Get('triggers')
    async getTriggers(@Request() req) {
        return this.aiTicketService.getTriggers(req.user.tenantId);
    }

    @Post('triggers')
    async createTrigger(@Request() req, @Body() body: { keyword: string; intent: string; assignedRole: string }) {
        return this.aiTicketService.createTrigger(req.user.tenantId, body.keyword, body.intent, body.assignedRole);
    }

    @Put('triggers/:id')
    async updateTrigger(
        @Request() req,
        @Param('id') id: string,
        @Body() body: { keyword: string; intent: string; assignedRole: string }
    ) {
        return this.aiTicketService.updateTrigger(req.user.tenantId, id, body);
    }

    @Delete('triggers/:id')
    async deleteTrigger(@Request() req, @Param('id') id: string) {
        return this.aiTicketService.deleteTrigger(req.user.tenantId, id);
    }

    @Get('config')
    async getConfig(@Request() req) {
        return this.aiTicketService.getConfig(req.user.tenantId);
    }

    @Post('config/toggle')
    async toggleAiTicketing(@Request() req, @Body() body: { enabled: boolean }) {
        return this.aiTicketService.toggleAiTicketing(req.user.tenantId, body.enabled);
    }
}
