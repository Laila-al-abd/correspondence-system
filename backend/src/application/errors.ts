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

export class InstitutionalNumberAlreadyInUseError extends ApplicationError {
  readonly code = 'INSTITUTIONAL_NUMBER_IN_USE'
  readonly status = 409
  constructor(value: string) {
    super(`Institutional number already in use: ${value}`)
  }
}

export class InvalidCredentialsError extends ApplicationError {
  readonly code = 'INVALID_CREDENTIALS'
  readonly status = 401
  constructor() {
    super('Invalid credentials.')
  }
}

export class InvalidTokenError extends ApplicationError {
  readonly code = 'INVALID_TOKEN'
  readonly status = 401
  constructor(message = 'Invalid or expired access token.') {
    super(message)
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

export class ForbiddenActionError extends ApplicationError {
  readonly code = 'FORBIDDEN'
  readonly status = 403
  constructor(message = 'You are not allowed to perform this action.') {
    super(message)
  }
}

export class UpstreamUnavailableError extends ApplicationError {
  readonly code = 'UPSTREAM_UNAVAILABLE'
  readonly status = 502
  constructor(message = 'An upstream service is currently unavailable.') {
    super(message)
  }
}

export class NotEligibleError extends ApplicationError {
  readonly code = 'NOT_ELIGIBLE'
  readonly status = 403
  constructor(
    readonly unmetRules: Array<{
      attributeCode?: string
      operator: string
      value: unknown
    }>,
  ) {
    super(
      `You do not meet the requirements for this request type: ${unmetRules
        .map((rule) => rule.attributeCode ?? 'an unnamed attribute')
        .join(', ')}`,
    )
  }
}

export class FilledDataInvalidError extends ApplicationError {
  readonly code = 'FILLED_DATA_INVALID'
  readonly status = 400
  constructor(readonly violations: Array<{ fieldKey: string; reason: string }>) {
    super(
      `The submitted form data does not match the template: ${violations
        .map((violation) => `${violation.fieldKey} -- ${violation.reason}`)
        .join('; ')}`,
    )
  }
}

export class ConcurrentModificationError extends ApplicationError {
  readonly code = 'CONCURRENT_MODIFICATION'
  readonly status = 409
  constructor(
    readonly entity: string,
    readonly entityId: string,
  ) {
    super(
      `This ${entity} was changed by someone else while you were working on it. ` +
        'Reload it and try your action again.',
    )
  }
}
