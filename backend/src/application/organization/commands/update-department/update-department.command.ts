export interface UpdateDepartmentInput {
  id: string
  name?: { ar: string; en?: string }
  description?: { ar: string; en?: string } | null
}

export class UpdateDepartmentCommand {
  constructor(public readonly input: UpdateDepartmentInput) {}
}
