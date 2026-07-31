/**
 * Self-registration input. Only the fields an anonymous applicant is allowed
 * to choose. User type, auth provider, institutional identity and department
 * are decided by the handler, not by the caller.
 */
export interface RegisterUserInput {
  fullNameAr: string
  fullNameEn?: string
  email: string
  phone?: string
  password: string
  applicantPurpose?: string // ApplicantPurpose
  preferredLang?: string
}

export class RegisterUserCommand {
  constructor(public readonly input: RegisterUserInput) {}
}
