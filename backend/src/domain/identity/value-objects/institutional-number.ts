import { ValueObject } from "../../shared/value-object"
import { Guard } from "../../shared/guard"
// The stable, cross-system identifier (SIS / LDAP correlation key). An employee
// keeps the same number everywhere, so this doubles as the external id.
export class InstitutionalNumber extends ValueObject<{ value: 
string }> {
private constructor(value: string) { super({ value }) }
static create(raw: string): InstitutionalNumber {
return new InstitutionalNumber(Guard.againstEmpty(raw, "institutionalNumber"))
}
get value(): string { return this.props.value }
}