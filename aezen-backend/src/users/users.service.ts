import { Injectable, OnModuleInit, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Tenant } from '../tenant/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    async onModuleInit() {
        await this.seedAdminUser();
    }

    async seedAdminUser() {
        const adminEmail = 'admin';
        const adminExists = await this.userRepository.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            console.log('Seeding admin user...');

            // Ensure default tenant exists
            let tenant = await this.tenantRepository.findOne({ where: { name: 'Default Tenant' } });
            if (!tenant) {
                tenant = this.tenantRepository.create({
                    name: 'Default Tenant',
                    dbName: 'aezen_default', // In a real app, this would be managed dynamically
                    dbHost: 'localhost',
                    dbPort: 5432,
                    dbUser: 'postgres',
                    dbPass: 'fastians', // Using same creds for simplicity in this demo
                    kbPointer: 'default-kb',
                });
                await this.tenantRepository.save(tenant);
            }

            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash('fastians', salt);

            const user = this.userRepository.create({
                email: adminEmail,
                passwordHash: passwordHash,
                role: 'Owner',
                tenant: tenant,
            });

            await this.userRepository.save(user);
            console.log('Admin user seeded successfully.');
        }
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // 1. Create Tenant
        // For SDPT, we might create a new DB here. For now, we'll just create the Tenant record.
        const tenant = this.tenantRepository.create({
            name: createUserDto.tenantName,
            // Generate a unique database name to prevent collisions
            dbName: `aezen_${createUserDto.tenantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            dbHost: 'localhost',
            dbPort: 5432,
            dbUser: 'postgres',
            dbPass: 'fastians',
            kbPointer: `kb-${createUserDto.tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        });
        await this.tenantRepository.save(tenant);

        // 2. Create User
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = this.userRepository.create({
            email: createUserDto.email,
            passwordHash: passwordHash,
            role: 'Owner',
            tenant: tenant,
        });

        return this.userRepository.save(user);
    }

    async findOne(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email }, relations: ['tenant'] });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id }, relations: ['tenant'] });
    }

    async findAllByTenant(tenantId: string): Promise<User[]> {
        return this.userRepository.find({ where: { tenant: { id: tenantId } } });
    }
}
