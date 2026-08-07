export interface RevokePermissionFromRoleInput {
  roleId: string
  permissionCode: string
}

export class RevokePermissionFromRoleCommand {
  constructor(public readonly input: RevokePermissionFromRoleInput) {}
}
