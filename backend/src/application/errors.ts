/**
 * Application-level errors. Unlike domain errors (which express broken
 * invariants), these express use-case outcomes such as conflicts and failed
 * authentication. The interface layer's DomainExceptionFilter maps each to its
 * HTTP status.
 */
export abstract class ApplicationError extends Error {
  abstract readonly code: string
  abstract readonly status: number
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class EmailAlreadyInUseError extends ApplicationError {
  readonly code = 'EMAIL_IN_USE'
  readonly status = 409
  constructor(email: string) {
    super(`Email already in use: ${email}`)
  }
}

export class InvalidCredentialsError extends ApplicationError {
  readonly code = 'INVALID_CREDENTIALS'
  readonly status = 401
  constructor() {
    super('Invalid credentials.')
  }
}

export class UnsupportedAuthMethodError extends ApplicationError {
  readonly code = 'UNSUPPORTED_AUTH_METHOD'
  readonly status = 400
  constructor(key: string) {
    super(`Unsupported authentication method: ${key}`)
  }
}

export class LanguageAlreadyExistsError extends ApplicationError {
  readonly code = 'LANGUAGE_EXISTS'
  readonly status = 409
  constructor(codeValue: string) {
    super(`Language already exists: ${codeValue}`)
  }
}

export class EntityNotFoundError extends ApplicationError {
  readonly code = 'NOT_FOUND'
  readonly status = 404
  constructor(entity: string, id?: string) {
    super(id ? `${entity} not found: ${id}` : `${entity} not found.`)
  }
}
