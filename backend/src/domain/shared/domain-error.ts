export abstract class DomainError extends Error {
abstract readonly code: string //readable (mapped to HTTP later)
constructor(message: string) {
super(message)
this.name = new.target.name
}
}
// stable, machine
export class RequiredFieldError extends DomainError {
readonly code = "REQUIRED_FIELD"
constructor(field: string) { super(`"${field}" is required.
`) }
}
export class InvariantViolationError extends DomainError {
readonly code = "INVARIANT_VIOLATION"
}