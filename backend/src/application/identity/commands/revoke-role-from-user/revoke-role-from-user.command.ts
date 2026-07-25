export interface RevokeRoleFromUserInput {
  userId: string
  roleId: string
  departmentId?: string
}

export class RevokeRoleFromUserCommand {
  constructor(public readonly input: RevokeRoleFromUserInput) {}
}
