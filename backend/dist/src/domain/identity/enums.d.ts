export declare enum UserType {
    APPLICANT = "APPLICANT",
    STUDENT = "STUDENT",
    EMPLOYEE = "EMPLOYEE",
    ADMIN = "ADMIN"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare enum ApplicantPurpose {
    STUDENT_ADMISSION = "STUDENT_ADMISSION",
    GRADUATE_PROGRAM = "GRADUATE_PROGRAM",
    JOB = "JOB"
}
export type AuthMethod = string;
export declare function parseUserType(value: string): UserType;
