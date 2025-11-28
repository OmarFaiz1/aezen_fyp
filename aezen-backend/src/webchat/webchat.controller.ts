import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { WebChatService } from './webchat.service';
import { GuestJwtAuthGuard } from './guest-jwt-auth.guard';

@Controller('webchat')
export class WebChatController {
    constructor(private readonly webChatService: WebChatService) { }

    @Post('identify')
    async identify(@Body() body: { tenantId: string; name: string; email: string }) {
        return this.webChatService.identify(body.tenantId, body.name, body.email);
    }

    @Get('config/:tenantId')
    async getConfig(@Param('tenantId') tenantId: string) {
        const name = await this.webChatService.getTenantName(tenantId);
        return { name };
    }

    @UseGuards(GuestJwtAuthGuard)
    @Get('messages')
    async getMessages(@Request() req) {
        return this.webChatService.getMessages(req.user.tenantId, req.user.sub);
    }

    @UseGuards(GuestJwtAuthGuard)
    @Post('send')
    async sendMessage(@Request() req, @Body() body: { content: string }) {
        return this.webChatService.sendMessage(req.user.tenantId, req.user.sub, body.content, req.user.email);
    }
}
