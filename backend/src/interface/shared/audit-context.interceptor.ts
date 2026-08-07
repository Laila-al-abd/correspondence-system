import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { isIP } from 'node:net'
import { Observable } from 'rxjs'
import { RequestContextStore } from '../../infrastructure/shared/request-context'
import { AuthenticatedRequestUser } from '../identity/authenticated-request'

/** The parts of the HTTP request this interceptor reads. */
interface ContextualRequest {
  user?: AuthenticatedRequestUser
  ip?: string
  socket?: { remoteAddress?: string }
}

/**
 * Copies the authenticated user (placed on request.user by JwtAuthGuard) and
 * the caller's IP address into the request-scoped context, so the Prisma audit
 * extension can stamp created_by / updated_by and the EventRecorder can stamp
 * actor and IP without either value being threaded down through every command.
 * It runs after the guards and inside the middleware's ALS scope, so the values
 * are visible for the entire handler and every database write it triggers.
 */
@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ContextualRequest>()
    const userId = request.user?.userId
    if (userId) RequestContextStore.set({ userId })
    const ipAddress = clientIp(request)
    if (ipAddress) RequestContextStore.set({ ipAddress })
    return next.handle()
  }
}

/** The IPv6 wrapper Node puts around an IPv4 address behind a dual-stack socket. */
const V4_IN_V6 = '::ffff:'

/**
 * The caller's address, in a form Postgres will accept.
 *
 * Validated rather than trusted: event_logs.ip_address is an inet column, and
 * an unparseable value there fails the insert -- which, because the audit row
 * is written inside the same transaction as the decision it records, would take
 * a legitimate approval down with it. Anything that is not an address is
 * recorded as no address at all.
 */
function clientIp(request: ContextualRequest): string | undefined {
  const raw = request.ip ?? request.socket?.remoteAddress
  if (!raw) return undefined
  const value = raw.startsWith(V4_IN_V6) ? raw.slice(V4_IN_V6.length) : raw
  return isIP(value) === 0 ? undefined : value
}
