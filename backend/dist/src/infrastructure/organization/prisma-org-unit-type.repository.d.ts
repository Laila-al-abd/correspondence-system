import { OrgUnitType } from '../../domain/organization/org-unit-type';
import { OrgUnitTypeRepository } from '../../domain/organization/ports/org-unit-type.repository';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaOrgUnitTypeRepository implements OrgUnitTypeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByCode(code: string): Promise<OrgUnitType | null>;
    list(): Promise<OrgUnitType[]>;
}
