export interface RegisterUserInput {
  type: string // UserType
  fullNameAr: string
  fullNameEn?: string
  email: string
  phone?: string
  institutionalNumber?: string
  password?: string // required for LOCAL auth
  authProvider: string // 'LOCAL' | 'OTP' | 'LDAP' | ...
  applicantPurpose?: string // ApplicantPurpose, applicants only
  departmentId?: string
  preferredLang?: string
}

export class RegisterUserCommand {
  constructor(public readonly input: RegisterUserInput) {}
}
