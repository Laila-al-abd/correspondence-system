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
