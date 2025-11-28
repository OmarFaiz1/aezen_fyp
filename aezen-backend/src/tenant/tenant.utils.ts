import { DataSource } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Conversation } from '../chat/conversation.entity';
import { Message } from '../chat/message.entity';
import { Ticket } from '../ticket/ticket.entity';

export const ensureTenantDatabaseExists = async (tenant: Tenant) => {
    const dataSource = new DataSource({
        type: 'postgres',
        host: tenant.dbHost,
        port: tenant.dbPort,
        username: tenant.dbUser,
        password: tenant.dbPass,
        database: 'postgres', // Connect to default DB to check/create others
    });

    try {
        await dataSource.initialize();
        const result = await dataSource.query(`SELECT 1 FROM pg_database WHERE datname = '${tenant.dbName}'`);

        if (result.length === 0) {
            await dataSource.query(`CREATE DATABASE "${tenant.dbName}"`);
        }
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
};

export const createTenantDataSource = async (tenant: Tenant): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: 'postgres',
        host: tenant.dbHost,
        port: tenant.dbPort,
        username: tenant.dbUser,
        password: tenant.dbPass,
        database: tenant.dbName,
        entities: [Conversation, Message, Ticket],
        synchronize: true, // Note: Disable in production, use migrations
    });

    await dataSource.initialize();
    return dataSource;
};
