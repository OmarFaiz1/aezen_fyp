import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
    constructor(private teamService: TeamService) { }

    @Post('members')
    async addMember(@Request() req, @Body() body: any) {
        // In a real app, check if req.user.role is Owner or Admin
        return this.teamService.addMember(req.user, body);
    }

    @Get('members')
    async getMembers(@Request() req) {
        return this.teamService.getMembers(req.user.tenantId);
    }

    @Patch('members/:id')
    async updateMember(@Request() req, @Param('id') id: string, @Body() body: any) {
        return this.teamService.updateMember(req.user, id, body);
    }

    @Delete('members/:id')
    async deleteMember(@Request() req, @Param('id') id: string) {
        return this.teamService.deleteMember(req.user, id);
    }
}
