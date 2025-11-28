import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
export class AdminUserController {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    @Post()
    async createUser(@Body() userData: Partial<User>) {
        // In a real app, hash password here
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    @Get()
    async getAllUsers() {
        return this.userRepository.find({ relations: ['tenant'] });
    }
}
