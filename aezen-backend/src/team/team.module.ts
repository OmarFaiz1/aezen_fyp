import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { User } from '../users/user.entity';
import { Tenant } from '../tenant/tenant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Tenant])],
    controllers: [TeamController],
    providers: [TeamService],
    exports: [TeamService],
})
export class TeamModule { }
