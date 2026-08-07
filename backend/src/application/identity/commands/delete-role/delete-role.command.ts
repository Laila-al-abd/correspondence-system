export interface DeleteRoleInput {
  roleId: string
}

export class DeleteRoleCommand {
  constructor(public readonly input: DeleteRoleInput) {}
}
