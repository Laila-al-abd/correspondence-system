import { ValueObject } from "../../shared/value-object"
import { Guard } from "../../shared/guard"
// Identity of a unit inside an external personnel system → drives idempotent sync.
export class ExternalRef extends ValueObject<{ id: string; source: string }> {
private constructor(props: { id: string; source: string }) 
{ super(props) }
static create(id: string, source: string): ExternalRef {
return new ExternalRef({ id: Guard.againstEmpty(id, "externalId"), source: Guard.againstEmpty(source, "sourceSystem") 
})
}
get id(): string { return this.props.id }
get source(): string { return this.props.source }
}