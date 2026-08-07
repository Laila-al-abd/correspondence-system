export interface GrantPermissionToRoleInput {
  roleId: string
  permissionCode: string
}

export class GrantPermissionToRoleCommand {
  constructor(public readonly input: GrantPermissionToRoleInput) {}
}
