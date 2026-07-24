import { RequestContextStore } from '../../infrastructure/shared/request-context'

/**
 * Express-level middleware that opens a fresh AsyncLocalStorage scope for every
 * request, before Nest's guards and interceptors run. It is registered with
 * app.use() in main.ts so it wraps the whole request lifecycle. The scope
 * starts empty; the AuditContextInterceptor fills in the authenticated user
 * once JwtAuthGuard has verified the token.
 */
export function requestContextMiddleware(
  _req: unknown,
  _res: unknown,
  next: () => void,
): void {
  RequestContextStore.run({}, () => next())
}
