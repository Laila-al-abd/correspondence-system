import { OrgUnitType } from '../../domain/organization/org-unit-type';
import { OrgUnitType as OrgUnitTypeRow } from '../../../generated/prisma/client';
export declare const OrgUnitTypeMapper: {
    toDomain(row: OrgUnitTypeRow): OrgUnitType;
};
