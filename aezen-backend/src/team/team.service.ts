import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Tenant } from '../tenant/tenant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    async addMember(currentUser: any, memberData: any) {
        // Verify current user has permission to add members (Owner or Admin with permission)
        // For now, we'll assume the Guard handles basic role checks, but we can add more granular checks here.

        const existingUser = await this.userRepository.findOne({ where: { email: memberData.email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const tenant = await this.tenantRepository.findOne({ where: { id: currentUser.tenantId } });
        if (!tenant) {
            throw new Error('Tenant not found');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(memberData.password, salt);

        const newUser = this.userRepository.create({
            email: memberData.email,
            passwordHash: passwordHash,
            role: memberData.role,
            name: memberData.name,
            permissions: memberData.permissions || [],
            tenant: tenant,
        });

        const savedUser = await this.userRepository.save(newUser);
        const { passwordHash: _, ...result } = savedUser;
        return result;
    }

    async getMembers(tenantId: string) {
        const users = await this.userRepository.find({
            where: { tenant: { id: tenantId } },
            select: ['id', 'email', 'name', 'role', 'permissions'], // Exclude passwordHash
        });
        return users;
    }

    async updateMember(currentUser: any, memberId: string, updates: any) {
        const member = await this.userRepository.findOne({ where: { id: memberId }, relations: ['tenant'] });
        if (!member) {
            throw new Error('Member not found');
        }

        // Check if target member is in the same tenant
        if (member.tenant.id !== currentUser.tenantId) {
            throw new Error('Unauthorized');
        }

        // Protect Owner role
        if (member.role === 'Owner') {
            throw new ConflictException('Cannot edit Owner');
        }

        // Only allow updating name, role, permissions
        if (updates.name) member.name = updates.name;
        if (updates.role && updates.role !== 'Owner') member.role = updates.role; // Prevent escalating to Owner via update for now
        if (updates.permissions) member.permissions = updates.permissions;

        return this.userRepository.save(member);
    }

    async deleteMember(currentUser: any, memberId: string) {
        const member = await this.userRepository.findOne({ where: { id: memberId }, relations: ['tenant'] });
        if (!member) {
            throw new Error('Member not found');
        }

        // Check if target member is in the same tenant
        if (member.tenant.id !== currentUser.tenantId) {
            throw new Error('Unauthorized');
        }

        // Protect Owner role
        if (member.role === 'Owner') {
            throw new ConflictException('Cannot delete Owner');
        }

        return this.userRepository.remove(member);
    }
}
