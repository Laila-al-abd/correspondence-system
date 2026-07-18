import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
export class Role extends AggregateRoot {
private constructor(
id: Identifier,
private props: { name: LocalizedText; isSystem: boolean; 
permissionCodes: Set<string> },
) { super(id) }
static create(id: Identifier, name: LocalizedText): Role {
return new Role(id, { name, isSystem: false, permissionCodes: new Set() })
}
static rehydrate(id: Identifier, props: { name: LocalizedText; isSystem: boolean; permissionCodes: Set<string> }) {
return new Role(id, props)
}
grant(code: string): void { this.props.permissionCodes.add
(code) }
revoke(code: string): void {
if (this.props.isSystem) throw new InvariantViolationError("System roles cannot be modified.")
this.props.permissionCodes.delete(code)
}
has(code: string): boolean { return this.props.permissionCodes.has(code) }
get permissions(): string[] { return [...this.props.permissionCodes] }
}