import { ValueObject } from "../../shared/value-object"
import { DomainError } from "../../shared/domain-error"
export class InvalidEmailError extends DomainError { readonly 
code = "INVALID_EMAIL" }
export class Email extends ValueObject<{ value: string }> {
private static RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
private constructor(value: string) { super({ value }) }
static create(raw: string): Email {
const value = raw?.trim().toLowerCase()
if (!value || !Email.RE.test(value)) throw new InvalidEmailError(`Invalid email: "${raw}"`)
return new Email(value)
}
get value(): string { return this.props.value }
}