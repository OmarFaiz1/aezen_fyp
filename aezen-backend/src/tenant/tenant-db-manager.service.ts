import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantConfigService } from './tenant-config.service';
import { createTenantDataSource } from './tenant.utils';

@Injectable()
export class TenantDbManagerService implements OnModuleDestroy {
    private dataSources: Map<string, DataSource> = new Map();

    constructor(
        private tenantConfigService: TenantConfigService,
    ) { }

    async getDataSource(tenantId: string): Promise<DataSource> {
        if (!tenantId) {
            throw new Error('Tenant ID is required');
        }

        if (this.dataSources.has(tenantId)) {
            const ds = this.dataSources.get(tenantId);
            if (ds && ds.isInitialized) {
                return ds;
            }
        }

        const tenant = await this.tenantConfigService.getDbConfig(tenantId);
        if (!tenant) {
            throw new Error('Tenant configuration not found');
        }

        const dataSource = await createTenantDataSource(tenant);
        this.dataSources.set(tenantId, dataSource);
        return dataSource;
    }

    async onModuleDestroy() {
        for (const dataSource of this.dataSources.values()) {
            if (dataSource.isInitialized) {
                await dataSource.destroy();
            }
        }
        this.dataSources.clear();
    }
}
