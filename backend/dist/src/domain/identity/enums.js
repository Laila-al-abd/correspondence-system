"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantPurpose = exports.UserStatus = exports.UserType = void 0;
exports.parseUserType = parseUserType;
var UserType;
(function (UserType) {
    UserType["APPLICANT"] = "APPLICANT";
    UserType["STUDENT"] = "STUDENT";
    UserType["EMPLOYEE"] = "EMPLOYEE";
    UserType["ADMIN"] = "ADMIN";
})(UserType || (exports.UserType = UserType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var ApplicantPurpose;
(function (ApplicantPurpose) {
    ApplicantPurpose["STUDENT_ADMISSION"] = "STUDENT_ADMISSION";
    ApplicantPurpose["GRADUATE_PROGRAM"] = "GRADUATE_PROGRAM";
    ApplicantPurpose["JOB"] = "JOB";
})(ApplicantPurpose || (exports.ApplicantPurpose = ApplicantPurpose = {}));
const USER_TYPES = new Set(Object.values(UserType));
function parseUserType(value) {
    if (!USER_TYPES.has(value))
        throw new Error(`Unknown user_type "${value}" in the database. Declared types: ${[...USER_TYPES].join(', ')}.`);
    return value;
}
//# sourceMappingURL=enums.js.map