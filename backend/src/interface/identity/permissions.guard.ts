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
import { PERMISSIONS_KEY } from './permissions.decorator'

/**
 * RBAC guard. Reads the permission codes declared by @RequirePermissions and
 * checks them against the caller's *effective* permissions — the set the
 * RoleRepository aggregates across every (scoped, non-expired) role the user
 * holds.
 *
 * Authentication (who the caller is) is still a stand-in: the user id comes from
 * the `x-user-id` header. that will be swaped for a verified JWT claim later; the
 * authorization logic here stays identical.
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
      .getRequest<{ headers: Record<string, string | undefined> }>()
    const userId = request.headers['x-user-id']
    if (!userId) throw new UnauthorizedException('Missing x-user-id header.')

    const granted = await this.roles.effectivePermissions(Identifier.of(userId))
    const missing = required.filter((code) => !granted.has(code))
    if (missing.length > 0)
      throw new ForbiddenException(
        `Missing required permission(s): ${missing.join(', ')}`,
      )

    return true
  }
}
