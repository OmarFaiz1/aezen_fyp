import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tenant')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  dbHost: string;

  @Column()
  dbPort: number;

  @Column()
  dbName: string;

  @Column()
  dbUser: string;

  @Column()
  dbPass: string;

  @Column()
  kbPointer: string; // Identifier for the isolated RAG index

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
