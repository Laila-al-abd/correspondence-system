import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { ExternalRef } from "./value-objects/external-ref"
interface DepartmentProps {
parentId?: Identifier
unitTypeId: Identifier
name: LocalizedText
description?: LocalizedText
isActive: boolean
externalRef?: ExternalRef    
sourceSystem: string            
lastSyncedAt?: Date
}
export class Department extends AggregateRoot {
private constructor(id: Identifier, private props: DepartmentProps) { super(id) }
/** Manually created unit. */
static create(id: Identifier, p: { parentId?: Identifier; unitTypeId: Identifier; name: LocalizedText; description?: LocalizedText }): Department {
if (p.parentId?.equals(id)) throw new InvariantViolationError("A department cannot be its own parent.")
return new Department(id, { ...p, isActive: true, sourceSystem: "MANUAL" })
}
/** Created/updated by the personnel sync (Adapter/ACL boundary). */
static fromExternal(id: Identifier, p: { unitTypeId: Identifier; name: LocalizedText; externalRef: ExternalRef; parentId?: Identifier; syncedAt: Date }): Department {
return new Department(id, {
parentId: p.parentId, unitTypeId: p.unitTypeId, name: p.name,
isActive: true, externalRef: p.externalRef, sourceSystem: p.externalRef.source, lastSyncedAt: p.syncedAt,})
}
static rehydrate(id: Identifier, props: DepartmentProps): Department { return new Department(id, props) }
rename(name: LocalizedText): void { this.props.name = name 
}
deactivate(): void { this.props.isActive = false }
attachTo(parentId: Identifier): void {
if (parentId.equals(this.id)) throw new InvariantViolationError("A department cannot be its own parent.")
this.props.parentId = parentId
}
/** Idempotent refresh from the external source; keeps manual edits' identity stable. */
applyExternalUpdate(name: LocalizedText, syncedAt: Date): void {
this.props.name = name
this.props.lastSyncedAt = syncedAt
}
get parentId(): Identifier | undefined { return this.props.
parentId }
get externalRef(): ExternalRef | undefined { return this.props.externalRef }
/** Flat, primitive view of the department for the persistence mapper. */
snapshot(): {
parentId?: string
unitTypeId: string
name: { ar: string; en?: string }
description?: { ar: string; en?: string }
isActive: boolean
externalId?: string
sourceSystem: string
lastSyncedAt?: Date
} {
return {
parentId: this.props.parentId?.toString(),
unitTypeId: this.props.unitTypeId.toString(),
name: this.props.name.toJSON(),
description: this.props.description?.toJSON(),
isActive: this.props.isActive,
externalId: this.props.externalRef?.id,
sourceSystem: this.props.sourceSystem,
lastSyncedAt: this.props.lastSyncedAt,
}
}
}