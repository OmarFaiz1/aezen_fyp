import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantConfigService } from './tenant-config.service';
import { createTenantDataSource, ensureTenantDatabaseExists } from './tenant.utils';

@Injectable()
export class TenantConnectionManager implements OnModuleDestroy {
    private connections: Map<string, DataSource> = new Map();
    private logger = new Logger('TenantConnectionManager');

    constructor(private tenantConfigService: TenantConfigService) { }

    async getTenantConnection(tenantId: string): Promise<DataSource> {
        const existingConnection = this.connections.get(tenantId);
        if (existingConnection) {
            if (existingConnection.isInitialized) {
                return existingConnection;
            }
            this.connections.delete(tenantId); // Remove stale connection
        }

        this.logger.log(`Creating new DB connection for tenant: ${tenantId}`);
        const tenant = await this.tenantConfigService.getDbConfig(tenantId);
        if (!tenant) {
            throw new Error(`Tenant configuration not found for ID: ${tenantId}`);
        }

        await ensureTenantDatabaseExists(tenant);
        const dataSource = await createTenantDataSource(tenant);
        this.connections.set(tenantId, dataSource);
        return dataSource;
    }

    async onModuleDestroy() {
        this.logger.log('Closing all tenant connections...');
        for (const [tenantId, connection] of this.connections) {
            if (connection.isInitialized) {
                await connection.destroy();
                this.logger.log(`Closed connection for tenant: ${tenantId}`);
            }
        }
        this.connections.clear();
    }
}
