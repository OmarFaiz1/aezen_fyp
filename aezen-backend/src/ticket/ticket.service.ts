import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantDbManagerService } from '../tenant/tenant-db-manager.service';
import { Ticket, TicketPriority, TicketStatus } from './ticket.entity';
import { UsersService } from '../users/users.service';

@Injectable({ scope: Scope.REQUEST })
export class TicketService {
    constructor(
        @Inject(REQUEST) private request: any,
        private tenantDbManager: TenantDbManagerService,
        private usersService: UsersService,
    ) { }

    private async getRepository() {
        const dataSource = await this.tenantDbManager.getDataSource();
        return dataSource.getRepository(Ticket);
    }

    async createTicket(data: {
        title: string;
        description?: string;
        priority: TicketPriority;
        status: TicketStatus;
        conversationId?: string;
        assignedToId?: string;
    }) {
        const repo = await this.getRepository();
        const tenantId = this.request.user.tenantId;
        const userId = this.request.user.userId;

        // Generate Ticket Number (TK###)
        // We need to find the last ticket number for this tenant
        const lastTicket = await repo.findOne({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });

        let nextNumber = 1;
        if (lastTicket && lastTicket.ticketNumber) {
            const match = lastTicket.ticketNumber.match(/TK(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        const ticketNumber = `TK${nextNumber.toString().padStart(3, '0')}`;

        const ticket = repo.create({
            ...data,
            ticketNumber,
            tenantId,
            createdById: userId,
        });
        console.log(`[TicketService] Creating ticket for tenant ${tenantId}, user ${userId}:`, ticket);

        return repo.save(ticket);
    }

    async getTickets(filters?: { status?: TicketStatus; priority?: TicketPriority; search?: string }) {
        const repo = await this.getRepository();
        const tenantId = this.request.user.tenantId;
        console.log(`[TicketService] getTickets called for tenantId: ${tenantId}`);

        const query = repo.createQueryBuilder('ticket')
            .where('ticket.tenantId = :tenantId', { tenantId })
            .leftJoinAndSelect('ticket.conversation', 'conversation');

        if (filters?.status && filters.status !== 'all' as any) {
            query.andWhere('ticket.status = :status', { status: filters.status });
        }

        if (filters?.priority && filters.priority !== 'all' as any) {
            query.andWhere('ticket.priority = :priority', { priority: filters.priority });
        }

        if (filters?.search) {
            query.andWhere('(ticket.title ILIKE :search OR ticket.ticketNumber ILIKE :search)', { search: `%${filters.search}%` });
        }

        query.orderBy('ticket.createdAt', 'DESC');

        const tickets = await query.getMany();

        // Enrich with user details manually since they are in a different DB
        console.log(`[TicketService] Found ${tickets.length} tickets for tenant ${tenantId}`);
        const enriched = await this.enrichTicketsWithUsers(tickets);
        console.log(`[TicketService] Enriched tickets:`, enriched);
        return enriched;
    }

    async getMyTickets(filters?: { status?: TicketStatus; priority?: TicketPriority; search?: string }) {
        const repo = await this.getRepository();
        const tenantId = this.request.user.tenantId;
        const userId = this.request.user.userId;
        console.log(`[TicketService] getMyTickets called for tenantId: ${tenantId}, userId: ${userId}`);

        const query = repo.createQueryBuilder('ticket')
            .where('ticket.tenantId = :tenantId', { tenantId })
            .andWhere('ticket.assignedToId = :userId', { userId })
            .leftJoinAndSelect('ticket.conversation', 'conversation');

        if (filters?.status && filters.status !== 'all' as any) {
            query.andWhere('ticket.status = :status', { status: filters.status });
        }

        if (filters?.priority && filters.priority !== 'all' as any) {
            query.andWhere('ticket.priority = :priority', { priority: filters.priority });
        }

        if (filters?.search) {
            query.andWhere('(ticket.title ILIKE :search OR ticket.ticketNumber ILIKE :search)', { search: `%${filters.search}%` });
        }

        query.orderBy('ticket.createdAt', 'DESC');

        const tickets = await query.getMany();
        console.log(`[TicketService] Found ${tickets.length} my tickets for user ${userId}`);
        return this.enrichTicketsWithUsers(tickets);
    }

    async updateTicket(id: string, data: Partial<Ticket>) {
        const repo = await this.getRepository();
        const ticket = await repo.findOne({ where: { id } });

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        Object.assign(ticket, data);
        return repo.save(ticket);
    }

    async getTicket(id: string) {
        const repo = await this.getRepository();
        const ticket = await repo.findOne({ where: { id }, relations: ['conversation'] });
        if (!ticket) return null;

        const enriched = await this.enrichTicketsWithUsers([ticket]);
        return enriched[0];
    }

    async getTicketByConversationId(conversationId: string) {
        const repo = await this.getRepository();
        // Find the latest open or in-progress ticket for this conversation
        const ticket = await repo.findOne({
            where: { conversationId },
            order: { createdAt: 'DESC' },
        });
        return ticket;
    }

    private async enrichTicketsWithUsers(tickets: Ticket[]) {
        if (!tickets.length) return [];

        // Collect all user IDs
        const userIds = new Set<string>();
        tickets.forEach(t => {
            if (t.assignedToId) userIds.add(t.assignedToId);
            if (t.createdById) userIds.add(t.createdById);
        });

        if (userIds.size === 0) return tickets;

        const tenantId = this.request.user.tenantId;
        console.log(`[TicketService] Enriching tickets for tenant ${tenantId}. User IDs:`, Array.from(userIds));

        try {
            const users = await this.usersService.findAllByTenant(tenantId);
            console.log(`[TicketService] Found ${users.length} users for tenant ${tenantId}`);
            const userMap = new Map(users.map(u => [u.id, u]));

            return tickets.map(t => {
                const assignedTo = t.assignedToId ? userMap.get(t.assignedToId) : undefined;
                const createdBy = t.createdById ? userMap.get(t.createdById) : undefined;
                return {
                    ...t,
                    assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name || '', email: assignedTo.email } : null,
                    createdBy: createdBy ? { id: createdBy.id, name: createdBy.name || '', email: createdBy.email } : null,
                };
            });
        } catch (error) {
            console.error(`[TicketService] Error enriching tickets:`, error);
            return tickets; // Return unenriched tickets on error
        }
    }
}

