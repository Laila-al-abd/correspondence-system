export interface LocalizedTextInput {
  ar: string
  en?: string
}

export interface CreateRoleInput {
  name: LocalizedTextInput
  description?: LocalizedTextInput
  // Permission codes the new role carries. Optional: a role with none is legal
  // and useful -- it can be created, reviewed, and filled in afterwards.
  permissionCodes?: string[]
  createdBy?: string
}

export class CreateRoleCommand {
  constructor(public readonly input: CreateRoleInput) {}
}
