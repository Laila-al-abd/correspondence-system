import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Department } from "../department"
import { ExternalRef } from "../value-objects/external-ref"
export interface DepartmentRepository extends Repository<Department> {
findByExternalRef(ref: ExternalRef): Promise<Department | null>
// Walks the tree upward until it hits a FACULTY-kind unit (for REQUESTER_FACULTY_DEAN).
findAncestorOfKind(departmentId: Identifier, kind: string): 
Promise<Department | null>
listChildren(parentId: Identifier): Promise<Department[]>
}
// domain/organization/ports/personnel-directory.ts
// The outbound port for the external personnel system. The HTTP adapter (with the
// YAML field-mapping) implements this in infrastructure; the domain stays ignorant of the wire format.
export interface ExternalOrgUnit {
externalId: string
parentExternalId: string | null
name: { ar: string; en?: string }
unitType: string
}
export interface PersonnelDirectory {
fetchUnits(): Promise<ExternalOrgUnit[]>
}