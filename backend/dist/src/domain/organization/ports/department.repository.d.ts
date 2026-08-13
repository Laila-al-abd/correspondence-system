import { Repository } from "../../shared/repository";
import { Identifier } from "../../shared/identifier";
import { Department } from "../department";
import { ExternalRef } from "../value-objects/external-ref";
export interface DepartmentRepository extends Repository<Department> {
    findByExternalRef(ref: ExternalRef): Promise<Department | null>;
    listBySource(source: string): Promise<Department[]>;
    findAncestorOfKind(departmentId: Identifier, kind: string): Promise<Department | null>;
    listChildren(parentId: Identifier): Promise<Department[]>;
}
export interface ExternalOrgUnit {
    externalId: string;
    parentExternalId: string | null;
    name: {
        ar: string;
        en?: string;
    };
    unitType: string;
}
export interface PersonnelDirectory {
    fetchUnits(): Promise<ExternalOrgUnit[]>;
    fetchUsers(): Promise<ExternalUser[] | null>;
}
export interface ExternalUser {
    institutionalNumber: string;
    name: {
        ar: string;
        en?: string;
    };
    email: string;
    phone?: string;
    userType: string;
    departmentExternalId: string | null;
}
