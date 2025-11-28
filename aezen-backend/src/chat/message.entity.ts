import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('message')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sender: 'user' | 'ai' | 'agent';

    @Column({ default: 'text' })
    type: 'text' | 'image';

    @Column({ nullable: true })
    mediaUrl: string;

    @Column({ default: false })
    isRead: boolean;

    @Column()
    content: string;

    @Column({ type: 'jsonb', nullable: true })
    responseMetadata: any;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    conversationId: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages)
    conversation: Conversation;
}
