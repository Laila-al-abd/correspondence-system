import { ConfigService } from '@nestjs/config';
import type { ExternalOrgUnit, ExternalUser, PersonnelDirectory } from '../../domain/organization/ports/department.repository';
export declare class HttpPersonnelDirectory implements PersonnelDirectory {
    private readonly config;
    private mappingCache?;
    private mappingCacheMtimeMs?;
    constructor(config: ConfigService);
    fetchUnits(): Promise<ExternalOrgUnit[]>;
    fetchUsers(): Promise<ExternalUser[] | null>;
    private join;
    private loadMapping;
    private get;
}
