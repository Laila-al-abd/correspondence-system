import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'required_permissions'

/**
 * Declares the permission codes a route requires. The PermissionsGuard reads
 * this metadata and checks it against the caller's effective permissions.
 *
 *   @RequirePermissions('user.manage')
 */
export const RequirePermissions = (...codes: string[]) =>
  SetMetadata(PERMISSIONS_KEY, codes)

export const ANY_PERMISSION_KEY = 'required_any_permission'

/**
 * Declares that ANY ONE of these permissions is enough, unlike
 * @RequirePermissions which demands all of them. Used where two different jobs
 * legitimately need the same read: the template catalogue is needed both by
 * whoever authors templates and by whoever (or whatever) classifies requests
 * against them.
 *
 *   @RequireAnyPermission('request.classify', 'template.manage')
 */
export const RequireAnyPermission = (...codes: string[]) =>
  SetMetadata(ANY_PERMISSION_KEY, codes)
