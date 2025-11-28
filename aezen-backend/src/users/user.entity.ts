import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    role: 'Owner' | 'Admin' | 'Agent';

    @Column()
    tenantId: string;

    @Column({ type: 'json', nullable: true })
    permissions: string[];

    @Column({ nullable: true })
    name: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.users)
    tenant: Tenant;
}
