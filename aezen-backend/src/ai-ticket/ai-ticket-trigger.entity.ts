import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';

@Entity('ai_ticket_trigger')
export class AiTicketTrigger {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    keyword: string;

    @Column()
    intent: string;

    @Column()
    assignedRole: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Tenant, (tenant) => tenant.users) // Assuming tenant relationship is generic or we just need the ID
    tenant: Tenant;
}
