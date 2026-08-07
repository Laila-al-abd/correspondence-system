export interface AssignRoleToUserInput {
  userId: string
  roleId: string
  departmentId?: string
  // Why this person holds this role. Free text, recorded on the assignment: the
  // question an audit asks about a role is never "who" but "on what grounds".
  reason?: string
  expiresAt?: string
  assignedBy?: string
}

export class AssignRoleToUserCommand {
  constructor(public readonly input: AssignRoleToUserInput) {}
}
