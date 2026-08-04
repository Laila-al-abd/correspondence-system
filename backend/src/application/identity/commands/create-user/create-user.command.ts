export interface CreateUserInput {
  userType: string
  fullNameAr: string
  fullNameEn?: string
  email: string
  phone?: string
  institutionalNumber: string
  /** Temporary password, handed to the person out of band. */
  password: string
  departmentId?: string
  preferredLang?: string
  /** Optional role to assign in the same transaction. */
  roleId?: string
  createdBy: string
}

export class CreateUserCommand {
  constructor(public readonly input: CreateUserInput) {}
}
