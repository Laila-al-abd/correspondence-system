export enum UserType { APPLICANT = "APPLICANT", STUDENT = "STUDENT", EMPLOYEE = "EMPLOYEE" }
export enum UserStatus { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE", SUSPENDED = "SUSPENDED" }
export enum ApplicantPurpose {
STUDENT_ADMISSION = "STUDENT_ADMISSION", GRADUATE_PROGRAM = 
"GRADUATE_PROGRAM", JOB = "JOB",
}
// Extensible on purpose — stored as VARCHAR in users.auth_provider.
export type AuthMethod = string   // 'LOCAL' | 'OTP' | 'LDAP'