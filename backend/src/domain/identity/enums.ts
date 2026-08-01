export enum UserType {
  APPLICANT = "APPLICANT",
  STUDENT = "STUDENT",
  EMPLOYEE = "EMPLOYEE",
  /**
   * Staff who administer the system itself. The seed writes this for the
   * bootstrap administrator and for the SYSTEM actor, so the enum has to
   * declare it: without it the database holds a value the domain says cannot
   * exist, and the mapper casts the difference away silently.
   */
  ADMIN = "ADMIN",
}

export enum UserStatus { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE", SUSPENDED = "SUSPENDED" }

export enum ApplicantPurpose {
  STUDENT_ADMISSION = "STUDENT_ADMISSION",
  GRADUATE_PROGRAM = "GRADUATE_PROGRAM",
  JOB = "JOB",
}

// Extensible on purpose — stored as VARCHAR in users.auth_provider.
export type AuthMethod = string   // 'LOCAL' | 'OTP' | 'LDAP'

const USER_TYPES: ReadonlySet<string> = new Set(Object.values(UserType))

/**
 * Turns a raw `users.user_type` string into the enum, refusing anything the
 * domain does not declare.
 *
 * The column is VARCHAR(30) with no database-level enum, so the only thing
 * standing between a typo in a seed or a migration and a value the code cannot
 * reason about is this function. It deliberately throws a plain Error rather
 * than a domain error: an unknown type is not a user mistake to be reported as
 * 400, it is corrupt data, and it should surface as a failure of the system.
 */
export function parseUserType(value: string): UserType {
  if (!USER_TYPES.has(value))
    throw new Error(
      `Unknown user_type "${value}" in the database. Declared types: ${[...USER_TYPES].join(', ')}.`,
    )
  return value as UserType
}
