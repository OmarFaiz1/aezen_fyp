import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTenantController } from './admin-tenant.controller';
import { AdminUserController } from './admin-user.controller';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant, User])],
    controllers: [AdminTenantController, AdminUserController],
})
export class AdminModule { }
