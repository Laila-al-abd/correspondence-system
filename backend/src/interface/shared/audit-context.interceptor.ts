import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { RequestContextStore } from '../../infrastructure/shared/request-context'
import { AuthenticatedRequestUser } from '../identity/authenticated-request'

/**
 * Copies the authenticated user (placed on request.user by JwtAuthGuard) into
 * the request-scoped context, so the Prisma audit extension can stamp
 * created_by / updated_by without any repository passing the id down. It runs
 * after the guards and inside the middleware's ALS scope, so the value is
 * visible for the entire handler and every database write it triggers.
 */
@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedRequestUser }>()
    const userId = request.user?.userId
    if (userId) RequestContextStore.set({ userId })
    return next.handle()
  }
}
