/**
 * Shape attached to the HTTP request by JwtAuthGuard once a token is verified.
 * Route handlers read it through the @CurrentUserId() decorator; the guard is
 * the only place that writes it.
 */
export interface AuthenticatedRequestUser {
  userId: string
  email?: string
}
