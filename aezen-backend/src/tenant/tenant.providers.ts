import { DataSource } from 'typeorm';
import { TenantDbManagerService } from './tenant-db-manager.service';
import { Conversation } from '../chat/conversation.entity';
import { Message } from '../chat/message.entity';

import { Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

export const tenantProviders = [
    {
        provide: TENANT_CONNECTION,
        scope: Scope.REQUEST,
        useFactory: async (tenantDbManager: TenantDbManagerService, request: any) => {
            const tenantId = request.user?.tenantId;
            if (!tenantId) {
                throw new Error('Tenant ID not found in request');
            }
            return tenantDbManager.getDataSource(tenantId);
        },
        inject: [TenantDbManagerService, REQUEST],
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
