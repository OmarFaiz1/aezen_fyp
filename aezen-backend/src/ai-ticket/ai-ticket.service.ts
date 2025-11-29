import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiTicketTrigger } from './ai-ticket-trigger.entity';
import { TicketService } from '../ticket/ticket.service';
import { TeamService } from '../team/team.service';
import axios from 'axios';

@Injectable()
export class AiTicketService {
    private logger = new Logger('AiTicketService');
    private readonly fastapiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';

    constructor(
        @InjectRepository(AiTicketTrigger)
        private triggerRepo: Repository<AiTicketTrigger>,
        private ticketService: TicketService,
        private teamService: TeamService,
    ) { }

    async getTriggers(tenantId: string) {
        return this.triggerRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
    }

    async createTrigger(tenantId: string, keyword: string, intent: string, assignedRole: string) {
        const trigger = this.triggerRepo.create({ tenantId, keyword, intent, assignedRole });
        return this.triggerRepo.save(trigger);
    }

    async updateTrigger(tenantId: string, id: string, updates: Partial<AiTicketTrigger>) {
        await this.triggerRepo.update({ id, tenantId }, updates);
        return this.triggerRepo.findOne({ where: { id } });
    }

    async deleteTrigger(tenantId: string, id: string) {
        return this.triggerRepo.delete({ id, tenantId });
    }

    async getConfig(tenantId: string) {
        // We need access to Tenant Repo. 
        // Since TeamService has it, let's use TeamService or inject TenantRepo here.
        // TeamService is already injected.
        return this.teamService.getTenantConfig(tenantId);
    }

    async toggleAiTicketing(tenantId: string, enabled: boolean) {
        return this.teamService.updateTenantConfig(tenantId, { aiTicketingEnabled: enabled });
    }

    async checkAndCreateTicket(tenantId: string, userId: string, message: string, conversationId: string) {
        try {
            this.logger.log(`[AiTicket] Checking ticket for tenant ${tenantId}, user ${userId}, msg: "${message}"`);

            // 0. Check if AI Ticketing is enabled for this tenant
            const tenantConfig = await this.teamService.getTenantConfig(tenantId);
            this.logger.log(`[AiTicket] Tenant Config: ${JSON.stringify(tenantConfig)}`);

            if (!tenantConfig || !tenantConfig.aiTicketingEnabled) {
                this.logger.log(`[AiTicket] AI Ticketing disabled for tenant ${tenantId}`);
                return null;
            }

            // 1. Get all triggers for this tenant
            const triggers = await this.getTriggers(tenantId);
            this.logger.log(`[AiTicket] Found ${triggers.length} triggers`);
            if (triggers.length === 0) return null;

            // 2. Call FastAPI to analyze message against triggers
            this.logger.log(`[AiTicket] Calling FastAPI: ${this.fastapiUrl}/analyze-ticket`);
            const payload = {
                message,
                triggers: triggers.map(t => ({ keyword: t.keyword, intent: t.intent, id: t.id }))
            };
            this.logger.log(`[AiTicket] Payload: ${JSON.stringify(payload)}`);

            const response = await axios.post(`${this.fastapiUrl}/analyze-ticket`, payload);
            this.logger.log(`[AiTicket] FastAPI Response: ${JSON.stringify(response.data)}`);

            const { match, triggerId, confidence } = response.data;

            if (match && triggerId) {
                const trigger = triggers.find(t => t.id === triggerId);
                if (!trigger) {
                    this.logger.warn(`[AiTicket] Trigger ID ${triggerId} matched but not found in list`);
                    return null;
                }

                this.logger.log(`[AiTicket] Match found: ${trigger.keyword} (Confidence: ${confidence})`);

                // 3. Find best member to assign
                const members = await this.teamService.getMembers(tenantId);
                const roleMembers = members.filter(m => m.specialRole === trigger.assignedRole);
                this.logger.log(`[AiTicket] Found ${roleMembers.length} members for role ${trigger.assignedRole}`);

                let assigneeId: string | undefined = undefined;

                if (roleMembers.length > 0) {
                    // Find member with least active tickets (random for MVP)
                    const randomMember = roleMembers[Math.floor(Math.random() * roleMembers.length)];
                    assigneeId = randomMember.id;
                    this.logger.log(`[AiTicket] Assigning to member: ${randomMember.email} (${assigneeId})`);
                } else {
                    this.logger.warn(`[AiTicket] No members found for role ${trigger.assignedRole}, leaving unassigned`);
                }

                // 4. Create Ticket
                const ticket = await this.ticketService.createTicket(
                    tenantId,
                    userId,
                    {
                        title: `AI Ticket: ${trigger.keyword}`,
                        description: `Automatically created based on user message: "${message}".\nIntent: ${trigger.intent}`,
                        priority: 'medium' as any,
                        status: 'open' as any,
                        conversationId,
                        assignedToId: assigneeId,
                        assignedByType: 'ai'
                    }
                );
                this.logger.log(`[AiTicket] Ticket created: ${ticket.id}`);

                return ticket;
            } else {
                this.logger.log(`[AiTicket] No match found.`);
            }

        } catch (error) {
            this.logger.error(`[AiTicket] Error checking ticket: ${error.message}`);
            if (error.response) {
                this.logger.error(`[AiTicket] FastAPI Error Data: ${JSON.stringify(error.response.data)}`);
            }
        }
        return null;
    }
}
