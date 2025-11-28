import { Injectable, Scope, Inject, OnModuleDestroy } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { TenantConfigService } from './tenant-config.service';
import { createTenantDataSource } from './tenant.utils';

@Injectable({ scope: Scope.REQUEST })
export class TenantDbManagerService implements OnModuleDestroy {
    private dataSource: DataSource;

    constructor(
        @Inject(REQUEST) private request: any,
        private tenantConfigService: TenantConfigService,
    ) { }

    async getDataSource(): Promise<DataSource> {
        if (this.dataSource) {
            return this.dataSource;
        }

        const tenantId = this.request.user?.tenantId;
        if (!tenantId) {
            throw new Error('Tenant ID not found in request');
        }

        const tenant = await this.tenantConfigService.getDbConfig(tenantId);
        if (!tenant) {
            throw new Error('Tenant configuration not found');
        }

        this.dataSource = await createTenantDataSource(tenant);
        return this.dataSource;
    }

    async onModuleDestroy() {
        if (this.dataSource && this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }
}
