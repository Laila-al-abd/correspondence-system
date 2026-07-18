import { ValueObject } from "../../shared/value-object"
import { Guard } from "../../shared/guard"
export class PersonName extends ValueObject<{ ar: string; en?: string }> {
private constructor(props: { ar: string; en?: string }) { super(props) }
static create(ar: string, en?: string): PersonName {
return new PersonName({ ar: Guard.againstEmpty(ar, "fullNameAr"), en: en?.trim() || undefined })
}
get ar(): string { return this.props.ar }
get en(): string | undefined { return this.props.en }
}