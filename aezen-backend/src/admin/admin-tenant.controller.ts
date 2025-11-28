import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Need to create this or use AuthGuard('jwt')

@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
export class AdminTenantController {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    @Post()
    async createTenant(@Body() tenantData: Partial<Tenant>) {
        const tenant = this.tenantRepository.create(tenantData);
        return this.tenantRepository.save(tenant);
    }

    @Get()
    async getAllTenants() {
        return this.tenantRepository.find();
    }
}
