import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ApplicationError } from '../../application/errors'
import { DomainError } from '../../domain/shared/domain-error'

interface ErrorBody {
  code: string
  message: string
  traceId: string
  timestamp: string
  path?: string
}

/**
 * The single place where every thrown error becomes an HTTP response.
 *
 * Design: controllers, handlers, and domain code NEVER import HttpException or
 * write try/catch for cross-cutting error shaping. They just throw typed
 * errors — DomainError (a broken invariant) or ApplicationError (a use-case
 * outcome: not found, conflict, bad credentials) — and this filter maps each
 * one to the right status and a consistent JSON envelope.
 *
 * Expected (typed) errors are returned as-is. Anything unexpected is LOGGED in
 * full with a traceId and returned as a safe 500 that carries the same traceId,
 * so the user can quote the id and you can find the exact stack in the logs.
 * Internal messages and stack traces are never leaked to the client.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp()
    const response = http.getResponse<{
      status: (code: number) => { json: (body: unknown) => void }
    }>()
    const request = http.getRequest<{ url?: string }>()

    const traceId = randomUUID()
    const path = request?.url

    const send = (status: number, code: string, message: string): void => {
      const body: ErrorBody = {
        code,
        message,
        traceId,
        timestamp: new Date().toISOString(),
        path,
      }
      response.status(status).json(body)
    }

    // Use-case outcomes carry their own status + machine-readable code.
    if (exception instanceof ApplicationError) {
      send(exception.status, exception.code, exception.message)
      return
    }

    // Broken domain invariants are the caller's fault -> 400.
    if (exception instanceof DomainError) {
      send(400, exception.code, exception.message)
      return
    }

    // Framework errors (e.g. ValidationPipe, guards) already carry a status.
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res = exception.getResponse()
      if (typeof res === 'string') {
        send(status, 'HTTP_ERROR', res)
        return
      }
      const payload = res as { message?: string | string[]; error?: string }
      const message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : (payload.message ?? exception.message)
      const code = payload.error
        ? payload.error.toUpperCase().replace(/\s+/g, '_')
        : 'HTTP_ERROR'
      send(status, code, message)
      return
    }

    // Anything else is a genuine bug or infrastructure failure. Log the real
    // cause (this is what was missing before) and return a safe envelope.
    this.logger.error(
      `Unhandled exception [${traceId}] ${path ?? ''}`.trim(),
      exception instanceof Error ? exception.stack : String(exception),
    )
    send(500, 'INTERNAL_ERROR', 'An unexpected error occurred.')
  }
}
