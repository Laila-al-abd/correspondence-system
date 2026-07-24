import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { RoleRepository } from '../../domain/identity/ports/role.repository'
import { Identifier } from '../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../application/tokens'
import { AuthenticatedRequestUser } from './authenticated-request'
import { PERMISSIONS_KEY } from './permissions.decorator'

/**
 * RBAC guard. Reads the permission codes declared by @RequirePermissions and
 * checks them against the caller's *effective* permissions — the set the
 * RoleRepository aggregates across every (scoped, non-expired) role the user
 * holds.
 *
 * Authentication (who the caller is) is handled upstream by the global
 * JwtAuthGuard, which verifies the Bearer token and puts the user on
 * `request.user`. This guard only decides authorization, so it stays identical
 * regardless of how the caller authenticated.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!required || required.length === 0) return true

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedRequestUser }>()
    const userId = request.user?.userId
    if (!userId) throw new UnauthorizedException('Not authenticated.')

    const granted = await this.roles.effectivePermissions(Identifier.of(userId))
    const missing = required.filter((code) => !granted.has(code))
    if (missing.length > 0)
      throw new ForbiddenException(
        `Missing required permission(s): ${missing.join(', ')}`,
      )

    return true
  }
}
