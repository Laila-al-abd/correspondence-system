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
import { ANY_PERMISSION_KEY, PERMISSIONS_KEY } from './permissions.decorator'

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
    const anyOf = this.reflector.getAllAndOverride<string[]>(
      ANY_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )
    const requiresAll = (required?.length ?? 0) > 0
    const requiresAny = (anyOf?.length ?? 0) > 0
    if (!requiresAll && !requiresAny) return true

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedRequestUser }>()
    const userId = request.user?.userId
    if (!userId) throw new UnauthorizedException('Not authenticated.')

    const granted = await this.roles.effectivePermissions(Identifier.of(userId))

    if (requiresAll) {
      const missing = (required ?? []).filter((code) => !granted.has(code))
      if (missing.length > 0)
        throw new ForbiddenException(
          `Missing required permission(s): ${missing.join(', ')}`,
        )
    }

    if (requiresAny && !(anyOf ?? []).some((code) => granted.has(code)))
      throw new ForbiddenException(
        `Requires one of: ${(anyOf ?? []).join(', ')}`,
      )

    return true
  }
}
