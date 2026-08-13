import type { ExternalOrgUnit, ExternalUser } from '../../domain/organization/ports/department.repository';
export interface PersonnelDirectoryMapping {
    recordsPath?: string;
    fields: {
        externalId: string;
        parentExternalId?: string;
        nameAr: string;
        nameEn?: string;
        unitType: string;
    };
    unitTypeMap?: Record<string, string>;
    users?: PersonnelUserMapping;
}
export interface PersonnelUserMapping {
    endpoint?: string;
    recordsPath?: string;
    fields: {
        institutionalNumber: string;
        fullNameAr: string;
        fullNameEn?: string;
        email: string;
        phone?: string;
        userType: string;
        departmentExternalId?: string;
    };
    userTypeMap?: Record<string, string>;
}
export declare function parseMapping(yamlText: string): PersonnelDirectoryMapping;
export declare function readPath(source: unknown, path: string): unknown;
export declare function extractRecords(payload: unknown, mapping: PersonnelDirectoryMapping): unknown[];
export declare function toExternalOrgUnit(record: unknown, mapping: PersonnelDirectoryMapping): ExternalOrgUnit;
export declare function toExternalUser(record: unknown, mapping: PersonnelUserMapping): ExternalUser;
