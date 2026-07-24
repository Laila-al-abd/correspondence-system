import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { AccessTokenService } from '../../domain/identity/ports/access-token.service'
import { ACCESS_TOKEN_SERVICE } from '../../application/tokens'
import { AuthenticatedRequestUser } from './authenticated-request'
import { IS_PUBLIC_KEY } from './public.decorator'

type AuthedRequest = {
  headers: Record<string, string | undefined>
  user?: AuthenticatedRequestUser
}

/**
 * Global authentication guard. It verifies the Bearer token on every request
 * and attaches the resulting user to `request.user`, unless the route is marked
 * @Public(). Authentication (who you are) lives here; authorization (what you
 * may do) stays in PermissionsGuard. Because this runs before any route-scoped
 * guard, the whole API is protected by default -- adding a new controller does
 * not mean remembering to add auth.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ACCESS_TOKEN_SERVICE) private readonly tokens: AccessTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<AuthedRequest>()
    const header = request.headers['authorization']
    if (!header || !header.startsWith('Bearer '))
      throw new UnauthorizedException(
        'Missing or malformed Authorization header.',
      )

    const claims = this.tokens.verify(header.slice('Bearer '.length).trim())
    request.user = { userId: claims.userId, email: claims.email }
    return true
  }
}
