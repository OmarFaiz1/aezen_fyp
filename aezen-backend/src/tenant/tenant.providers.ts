import { DataSource } from 'typeorm';
import { TenantDbManagerService } from './tenant-db-manager.service';
import { Conversation } from '../chat/conversation.entity';
import { Message } from '../chat/message.entity';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

export const tenantProviders = [
    {
        provide: TENANT_CONNECTION,
        useFactory: async (tenantDbManager: TenantDbManagerService) => {
            return tenantDbManager.getDataSource();
        },
        inject: [TenantDbManagerService],
    },
    {
        provide: 'CONVERSATION_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Conversation),
        inject: [TENANT_CONNECTION],
    },
    {
        provide: 'MESSAGE_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
        inject: [TENANT_CONNECTION],
    },
];
