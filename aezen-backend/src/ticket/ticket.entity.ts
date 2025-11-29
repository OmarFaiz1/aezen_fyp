import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from '../chat/conversation.entity';


export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in-progress',
    RESOLVED = 'resolved',
}

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ticketNumber: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.LOW,
    })
    priority: TicketPriority;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column()
    tenantId: string;

    @Column({ nullable: true })
    conversationId: string;

    @ManyToOne(() => Conversation)
    @JoinColumn({ name: 'conversationId' })
    conversation: Conversation;

    @Column({ nullable: true })
    assignedToId: string;

    @Column({ nullable: true })
    createdById: string;

    @Column({ default: 'human' })
    assignedByType: 'ai' | 'human';

    @Column({ nullable: true })
    assignedByUserId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
