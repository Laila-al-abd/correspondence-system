"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncUsersFromDirectory = void 0;
const user_1 = require("../../domain/identity/user");
const enums_1 = require("../../domain/identity/enums");
const email_1 = require("../../domain/identity/value-objects/email");
const person_name_1 = require("../../domain/identity/value-objects/person-name");
const institutional_number_1 = require("../../domain/identity/value-objects/institutional-number");
const external_ref_1 = require("../../domain/organization/value-objects/external-ref");
const domain_error_1 = require("../../domain/shared/domain-error");
const errors_1 = require("../errors");
const DIRECTORY_AUTH_PROVIDER = 'LDAP';
class SyncUsersFromDirectory {
    directory;
    users;
    departments;
    ids;
    transaction;
    userTypeAttribute;
    constructor(directory, users, departments, ids, transaction, userTypeAttribute) {
        this.directory = directory;
        this.users = users;
        this.departments = departments;
        this.ids = ids;
        this.transaction = transaction;
        this.userTypeAttribute = userTypeAttribute;
    }
    async execute(source) {
        const people = await this.directory.fetchUsers();
        if (people === null)
            throw new errors_1.UpstreamUnavailableError('The personnel directory mapping has no `users:` block, so this ' +
                'directory does not publish people. Add one to enable user sync.');
        const known = new Set(Object.values(enums_1.UserType));
        const bad = new Set();
        for (const code of new Set(people.map((p) => p.userType))) {
            if (!known.has(code) || code === enums_1.UserType.APPLICANT)
                bad.add(code);
        }
        if (bad.size > 0)
            throw new domain_error_1.InvariantViolationError(`Unusable user type(s) ${[...bad].map((c) => `'${c}'`).join(', ')} ` +
                `received from ${source}. Map them to EMPLOYEE, STUDENT or ADMIN in ` +
                'userTypeMap; APPLICANT is not importable because applicants ' +
                'self-register. Nothing was imported.');
        return this.transaction.run(() => this.write(people, source, new Date()));
    }
    async write(people, source, syncedAt) {
        const result = {
            source,
            created: 0,
            updated: 0,
            upgraded: 0,
            total: people.length,
            skipped: [],
            unresolvedDepartments: [],
        };
        const departmentCache = new Map();
        for (const person of people) {
            const number = institutional_number_1.InstitutionalNumber.create(person.institutionalNumber);
            const name = person_name_1.PersonName.create(person.name.ar, person.name.en);
            const email = email_1.Email.create(person.email);
            const departmentId = await this.resolveDepartment(person.departmentExternalId, source, departmentCache, result);
            const byNumber = await this.users.findByInstitutionalNumber(number);
            if (byNumber) {
                byNumber.applyDirectoryUpdate({ name, email, departmentId }, syncedAt);
                await this.users.save(byNumber);
                await this.userTypeAttribute.write(byNumber.id, byNumber.type);
                result.updated += 1;
                continue;
            }
            const byEmail = await this.users.findByEmail(email);
            if (byEmail) {
                if (byEmail.type !== enums_1.UserType.APPLICANT) {
                    result.skipped.push({
                        institutionalNumber: person.institutionalNumber,
                        reason: `Email ${person.email} already belongs to another non-applicant account.`,
                    });
                    continue;
                }
                byEmail.upgradeToDirectoryUser({
                    type: person.userType,
                    institutionalNumber: number,
                    name,
                    phone: person.phone,
                    departmentId,
                    syncedAt,
                });
                await this.users.save(byEmail);
                await this.userTypeAttribute.write(byEmail.id, byEmail.type);
                result.upgraded += 1;
                continue;
            }
            const created = user_1.User.fromExternal(this.ids.next(), {
                type: person.userType,
                name,
                email,
                institutionalNumber: number,
                authProvider: DIRECTORY_AUTH_PROVIDER,
                phone: person.phone,
                departmentId,
                syncedAt,
            });
            await this.users.save(created);
            await this.userTypeAttribute.write(created.id, created.type);
            result.created += 1;
        }
        return result;
    }
    async resolveDepartment(externalId, source, cache, result) {
        if (!externalId)
            return undefined;
        if (cache.has(externalId))
            return cache.get(externalId);
        const department = await this.departments.findByExternalRef(external_ref_1.ExternalRef.create(externalId, source));
        const id = department?.id;
        cache.set(externalId, id);
        if (!id)
            result.unresolvedDepartments.push(externalId);
        return id;
    }
}
exports.SyncUsersFromDirectory = SyncUsersFromDirectory;
//# sourceMappingURL=sync-users-from-directory.js.map