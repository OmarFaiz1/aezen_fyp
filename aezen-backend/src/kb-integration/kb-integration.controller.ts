import {
    Controller,
    Post,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Req,
    Get,
    Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KbIntegrationService } from './kb-integration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('kb')
@UseGuards(JwtAuthGuard)
export class KbIntegrationController {
    constructor(private readonly kbService: KbIntegrationService) { }

    @Post('ingest/document')
    @UseInterceptors(FileInterceptor('file'))
    async ingestDocument(
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const user = req.user as any;
        console.log(`[KbController] Uploading document for tenant ${user.tenantId}: ${file.originalname}`);
        return this.kbService.ingestDocument(user.tenantId, file);
    }

    @Post('ingest/url')
    async ingestUrl(@Req() req: Request, @Body('url') url: string) {
        const user = req.user as any;
        return this.kbService.ingestUrl(user.tenantId, url);
    }

    @Get('status')
    async getStatus(@Req() req: Request) {
        const user = req.user as any;
        return this.kbService.getStatus(user.tenantId);
    }

    @Post('delete/:sourceId') // Using POST for simplicity with FormData, or DELETE
    async deleteDocument(@Req() req: Request, @Param('sourceId') sourceId: string) {
        const user = req.user as any;
        return this.kbService.deleteDocument(user.tenantId, sourceId);
    }
}
