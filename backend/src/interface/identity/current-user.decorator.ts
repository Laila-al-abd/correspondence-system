import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

/**
 * Resolves the caller's user id for a route handler.
 *
 * TEMPORARY: reads the `x-user-id` request header as a stand-in for real
 * authentication. When JWT login lands, the extraction below will be replaced with the
 * verified token claim — no controller or guard code needs to change.
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>()
    const userId = request.headers['x-user-id']
    if (!userId) throw new UnauthorizedException('Missing x-user-id header.')
    return userId
  },
)
