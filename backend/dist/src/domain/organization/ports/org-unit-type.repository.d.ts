import { OrgUnitType } from "../org-unit-type";
export interface OrgUnitTypeRepository {
    findByCode(code: string): Promise<OrgUnitType | null>;
    list(): Promise<OrgUnitType[]>;
}
