import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('conversation')
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string; // User ID from Master DB or Guest ID

    @Column({ default: 'web' })
    platform: 'whatsapp' | 'web';

    @Column({ nullable: true })
    tenantId: string;

    @Column({ nullable: true })
    contactName: string;

    @Column({ nullable: true })
    contactNumber: string;

    @Column({ default: 0 })
    unreadCount: number;

    @Column({ nullable: true })
    lastMessage: string;

    @Column({ nullable: true })
    lastMessageAt: Date;

    @CreateDateColumn()
    startedAt: Date;

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];
}
