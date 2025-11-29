import { Injectable } from '@nestjs/common';
import { TenantDbManagerService } from '../tenant/tenant-db-manager.service';
import { Ticket, TicketPriority, TicketStatus } from './ticket.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TicketService {
    constructor(
        private tenantDbManager: TenantDbManagerService,
        private usersService: UsersService,
    ) { }

    private async getRepository(tenantId: string) {
        const dataSource = await this.tenantDbManager.getDataSource(tenantId);
        return dataSource.getRepository(Ticket);
    }

    async createTicket(tenantId: string, userId: string, data: {
        title: string;
        description?: string;
        priority: TicketPriority;
        status: TicketStatus;
        conversationId?: string;
        assignedToId?: string;
        assignedByType?: 'ai' | 'human';
    }) {
        const repo = await this.getRepository(tenantId);

        // Generate Ticket Number (TK###)
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
            assignedByType: data.assignedByType || 'human',
            assignedByUserId: userId, // Track who created/assigned it
        });
        console.log(`[TicketService] Creating ticket for tenant ${tenantId}, user ${userId}:`, ticket);

        return repo.save(ticket);
    }

    async deleteTicket(tenantId: string, id: string) {
        const repo = await this.getRepository(tenantId);
        const ticket = await repo.findOne({ where: { id } });
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return repo.remove(ticket);
    }

    async getTickets(tenantId: string, filters?: { status?: TicketStatus; priority?: TicketPriority; search?: string; assignedByType?: 'ai' | 'human' | 'all' }) {
        const repo = await this.getRepository(tenantId);
        console.log(`[TicketService] getTickets called for tenantId: ${tenantId}, filters: ${JSON.stringify(filters)}`);

        const query = repo.createQueryBuilder('ticket')
            .where('ticket.tenantId = :tenantId', { tenantId })
            .leftJoinAndSelect('ticket.conversation', 'conversation');

        if (filters?.status && filters.status !== 'all' as any) {
            query.andWhere('ticket.status = :status', { status: filters.status });
        }

        if (filters?.priority && filters.priority !== 'all' as any) {
            query.andWhere('ticket.priority = :priority', { priority: filters.priority });
        }

        if (filters?.assignedByType && filters.assignedByType !== 'all' as any) {
            console.log(`[TicketService] Applying assignedByType filter: ${filters.assignedByType}`);
            query.andWhere('ticket.assignedByType = :assignedByType', { assignedByType: filters.assignedByType });
        }

        if (filters?.search) {
            query.andWhere('(ticket.title ILIKE :search OR ticket.ticketNumber ILIKE :search)', { search: `%${filters.search}%` });
        }

        query.orderBy('ticket.createdAt', 'DESC');

        console.log(`[TicketService] Generated SQL: ${query.getSql()}`);
        console.log(`[TicketService] Parameters: ${JSON.stringify(query.getParameters())}`);

        const tickets = await query.getMany();

        // Enrich with user details manually since they are in a different DB
        console.log(`[TicketService] Found ${tickets.length} tickets for tenant ${tenantId}`);
        const enriched = await this.enrichTicketsWithUsers(tenantId, tickets);
        // console.log(`[TicketService] Enriched tickets:`, enriched);
        return enriched;
    }

    async getMyTickets(tenantId: string, userId: string, filters?: { status?: TicketStatus; priority?: TicketPriority; search?: string; assignedByType?: 'ai' | 'human' | 'all' }) {
        const repo = await this.getRepository(tenantId);
        console.log(`[TicketService] getMyTickets called for tenantId: ${tenantId}, userId: ${userId}, filters: ${JSON.stringify(filters)}`);

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

        if (filters?.assignedByType && filters.assignedByType !== 'all' as any) {
            query.andWhere('ticket.assignedByType = :assignedByType', { assignedByType: filters.assignedByType });
        }

        if (filters?.search) {
            query.andWhere('(ticket.title ILIKE :search OR ticket.ticketNumber ILIKE :search)', { search: `%${filters.search}%` });
        }

        query.orderBy('ticket.createdAt', 'DESC');

        const tickets = await query.getMany();
        console.log(`[TicketService] Found ${tickets.length} my tickets for user ${userId}`);
        return this.enrichTicketsWithUsers(tenantId, tickets);
    }

    async updateTicket(tenantId: string, id: string, data: Partial<Ticket>) {
        const repo = await this.getRepository(tenantId);
        const ticket = await repo.findOne({ where: { id } });

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        Object.assign(ticket, data);
        return repo.save(ticket);
    }

    async getTicket(tenantId: string, id: string) {
        const repo = await this.getRepository(tenantId);
        const ticket = await repo.findOne({ where: { id }, relations: ['conversation'] });
        if (!ticket) return null;

        const enriched = await this.enrichTicketsWithUsers(tenantId, [ticket]);
        return enriched[0];
    }

    async getTicketByConversationId(tenantId: string, conversationId: string) {
        const repo = await this.getRepository(tenantId);
        // Find the latest open or in-progress ticket for this conversation
        const ticket = await repo.findOne({
            where: { conversationId },
            order: { createdAt: 'DESC' },
        });
        return ticket;
    }

    private async enrichTicketsWithUsers(tenantId: string, tickets: Ticket[]) {
        if (!tickets.length) return [];

        // Collect all user IDs
        const userIds = new Set<string>();
        tickets.forEach(t => {
            if (t.assignedToId) userIds.add(t.assignedToId);
            if (t.createdById) userIds.add(t.createdById);
            if (t.assignedByUserId) userIds.add(t.assignedByUserId);
        });

        if (userIds.size === 0) return tickets;

        console.log(`[TicketService] Enriching tickets for tenant ${tenantId}. User IDs:`, Array.from(userIds));

        try {
            const users = await this.usersService.findAllByTenant(tenantId);
            console.log(`[TicketService] Found ${users.length} users for tenant ${tenantId}`);
            const userMap = new Map(users.map(u => [u.id, u]));

            return tickets.map(t => {
                const assignedTo = t.assignedToId ? userMap.get(t.assignedToId) : undefined;
                const createdBy = t.createdById ? userMap.get(t.createdById) : undefined;
                const assignedByUser = t.assignedByUserId ? userMap.get(t.assignedByUserId) : undefined;
                return {
                    ...t,
                    assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name || '', email: assignedTo.email } : null,
                    createdBy: createdBy ? { id: createdBy.id, name: createdBy.name || '', email: createdBy.email } : null,
                    assignedByUser: assignedByUser ? { id: assignedByUser.id, name: assignedByUser.name || '', email: assignedByUser.email } : null,
                };
            });
        } catch (error) {
            console.error(`[TicketService] Error enriching tickets:`, error);
            return tickets; // Return unenriched tickets on error
        }
    }
}

