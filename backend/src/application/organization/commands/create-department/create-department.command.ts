export interface CreateDepartmentInput {
  unitTypeCode: string
  name: { ar: string; en?: string }
  description?: { ar: string; en?: string }
  parentId?: string
}

export class CreateDepartmentCommand {
  constructor(public readonly input: CreateDepartmentInput) {}
}
