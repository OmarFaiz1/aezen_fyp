import { Controller, Post, Get, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from './dtos/create-message.dto';
import { SendImageDto } from './dtos/send-image.dto';

@Controller('integrations/whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
    constructor(private readonly whatsappService: WhatsAppService) { }

    @Post('toggle')
    async toggleIntegration(@Request() req, @Body() body: { enabled: boolean }) {
        const tenantId = req.user.tenantId;
        if (body.enabled) {
            await this.whatsappService.initializeSession(tenantId);
            return { message: 'WhatsApp initialization started' };
        } else {
            await this.whatsappService.disconnect(tenantId);
            return { message: 'WhatsApp disconnected' };
        }
    }

    @Get('status')
    async getStatus(@Request() req) {
        const tenantId = req.user.tenantId;
        return this.whatsappService.getStatus(tenantId);
    }

    @Post('reconfigure')
    async reconfigure(@Request() req) {
        const tenantId = req.user.tenantId;
        return this.whatsappService.resetSession(tenantId);
    }

    @Post('send')
    async sendMessage(@Request() req, @Body() body: CreateMessageDto) {
        const tenantId = req.user.tenantId;
        if (!body.conversationId) throw new BadRequestException('Conversation ID required');
        return this.whatsappService.sendMessage(tenantId, body.conversationId, body.content);
    }

    @Post('send-image')
    async sendImage(@Request() req, @Body() body: SendImageDto) {
        const tenantId = req.user.tenantId;
        return this.whatsappService.sendImage(tenantId, body);
    }
}
