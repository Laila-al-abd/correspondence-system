export interface AssignRoleToUserInput {
  userId: string
  roleId: string
  departmentId?: string
  expiresAt?: string
  assignedBy?: string
}

export class AssignRoleToUserCommand {
  constructor(public readonly input: AssignRoleToUserInput) {}
}
