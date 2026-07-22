import { OrgUnitType } from "../org-unit-type"

// Lookup port for org-unit types, keyed by their stable code (UNIVERSITY, FACULTY, ...).
export interface OrgUnitTypeRepository {
  findByCode(code: string): Promise<OrgUnitType | null>
}
