"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_1 = require("../../domain/identity/user");
const identifier_1 = require("../../domain/shared/identifier");
const email_1 = require("../../domain/identity/value-objects/email");
const person_name_1 = require("../../domain/identity/value-objects/person-name");
const institutional_number_1 = require("../../domain/identity/value-objects/institutional-number");
const enums_1 = require("../../domain/identity/enums");
exports.UserMapper = {
    toDomain(row) {
        return user_1.User.rehydrate(identifier_1.Identifier.of(row.id), {
            type: (0, enums_1.parseUserType)(row.userType),
            name: person_name_1.PersonName.create(row.fullNameAr, row.fullNameEn ?? undefined),
            email: email_1.Email.create(row.email),
            phone: row.phone ?? undefined,
            institutionalNumber: row.institutionalNumber
                ? institutional_number_1.InstitutionalNumber.create(row.institutionalNumber)
                : undefined,
            passwordHash: row.passwordHash ?? undefined,
            authProvider: row.authProvider,
            applicantPurpose: row.applicantPurpose ?? undefined,
            departmentId: row.departmentId ? identifier_1.Identifier.of(row.departmentId) : undefined,
            preferredLang: row.preferredLang,
            status: row.status,
            lastSyncedAt: row.lastSyncedAt ?? undefined,
        });
    },
    toPersistence(user) {
        const s = user.snapshot();
        return {
            id: user.id.toString(),
            userType: s.type,
            fullNameAr: s.fullNameAr,
            fullNameEn: s.fullNameEn ?? null,
            institutionalNumber: s.institutionalNumber ?? null,
            email: s.email,
            phone: s.phone ?? null,
            passwordHash: s.passwordHash ?? null,
            authProvider: s.authProvider,
            applicantPurpose: s.applicantPurpose ?? null,
            departmentId: s.departmentId ? s.departmentId : null,
            preferredLang: s.preferredLang,
            status: s.status,
            lastSyncedAt: s.lastSyncedAt ?? null,
        };
    },
};
//# sourceMappingURL=user.mapper.js.map