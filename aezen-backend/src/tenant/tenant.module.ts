import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { TenantConfigService } from './tenant-config.service';
import { TenantDbManagerService } from './tenant-db-manager.service';
import { TenantConnectionManager } from './tenant-connection.manager';
import { tenantProviders } from './tenant.providers';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Tenant])],
    providers: [
        TenantConfigService,
        TenantDbManagerService,
        TenantConnectionManager,
        ...tenantProviders,
    ],
    exports: [
        TenantConfigService,
        TenantDbManagerService,
        TenantConnectionManager,
        ...tenantProviders,
    ],
})
export class TenantModule { }
