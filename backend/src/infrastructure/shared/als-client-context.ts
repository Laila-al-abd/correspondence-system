import { Injectable } from '@nestjs/common'
import type { ClientContextPort } from '../../application/observability/ports/client-context.port'
import { RequestContextStore } from './request-context'

/**
 * Reads the caller's identity and address out of the request-scoped
 * AsyncLocalStorage scope opened by requestContextMiddleware and filled by
 * AuditContextInterceptor.
 */
@Injectable()
export class AlsClientContext implements ClientContextPort {
  userId(): string | undefined {
    return RequestContextStore.userId()
  }

  ipAddress(): string | undefined {
    return RequestContextStore.ipAddress()
  }
}
