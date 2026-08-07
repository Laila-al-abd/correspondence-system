import type { LocalizedTextInput } from '../create-role/create-role.command'

export interface UpdateRoleInput {
  roleId: string
  // Always sent: a role cannot be nameless. An omitted description clears the
  // existing one, which is the only way to remove it.
  name: LocalizedTextInput
  description?: LocalizedTextInput
}

export class UpdateRoleCommand {
  constructor(public readonly input: UpdateRoleInput) {}
}
