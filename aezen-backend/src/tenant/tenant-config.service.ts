import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantConfigService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    async getDbConfig(tenantId: string): Promise<Tenant | null> {
        return this.tenantRepository.findOne({ where: { id: tenantId } });
    }
}
