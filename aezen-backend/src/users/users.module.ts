import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Tenant } from '../tenant/tenant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Tenant])],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
