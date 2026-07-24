import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthenticatedRequestUser } from './authenticated-request'

/**
 * Resolves the caller's user id for a route handler.
 *
 * The id comes from `request.user`, which JwtAuthGuard populates after it has
 * verified the Bearer token. Controllers and use cases are unchanged by how
 * authentication works -- they just ask for the current user id.
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedRequestUser }>()
    const userId = request.user?.userId
    if (!userId) throw new UnauthorizedException('Not authenticated.')
    return userId
  },
)
