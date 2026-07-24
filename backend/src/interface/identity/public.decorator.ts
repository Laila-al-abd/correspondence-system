import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'is_public_route'

/**
 * Marks a route (or whole controller) as reachable without authentication, so
 * the global JwtAuthGuard lets it through. Used for login, registration, and
 * the health check.
 *
 *   @Public()
 *   @Post('login')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
