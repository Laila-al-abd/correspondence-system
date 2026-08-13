"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
class User extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, props) {
        if (props.type === enums_1.UserType.APPLICANT && props.institutionalNumber)
            throw new domain_error_1.InvariantViolationError("Applicants must not have an institutional number.");
        if (props.type !== enums_1.UserType.APPLICANT && !props.institutionalNumber)
            throw new domain_error_1.InvariantViolationError("Students and employees require an institutional number.");
        if (props.authProvider === "LOCAL" && !props.passwordHash)
            throw new domain_error_1.InvariantViolationError("LOCAL auth requires a password hash.");
        if (props.applicantPurpose && props.type !== enums_1.UserType.APPLICANT)
            throw new domain_error_1.InvariantViolationError("applicantPurpose is only valid for applicants.");
        return new User(id, props);
    }
    static rehydrate(id, props) {
        return new User(id, props);
    }
    static fromExternal(id, p) {
        if (p.type === enums_1.UserType.APPLICANT)
            throw new domain_error_1.InvariantViolationError("Applicants self-register; they are not imported from the directory.");
        if (p.authProvider === "LOCAL")
            throw new domain_error_1.InvariantViolationError("Directory users authenticate externally and have no LOCAL password.");
        return new User(id, {
            type: p.type,
            name: p.name,
            email: p.email,
            phone: p.phone,
            institutionalNumber: p.institutionalNumber,
            authProvider: p.authProvider,
            departmentId: p.departmentId,
            preferredLang: p.preferredLang ?? "ar",
            status: enums_1.UserStatus.ACTIVE,
            lastSyncedAt: p.syncedAt,
        });
    }
    hasLocalPassword() { return !!this.props.passwordHash; }
    get passwordHash() {
        return this.props.
            passwordHash;
    }
    get status() { return this.props.status; }
    get authProvider() { return this.props.authProvider; }
    setPasswordHash(hash) {
        if (this.props.authProvider !== "LOCAL")
            throw new domain_error_1.InvariantViolationError("Only LOCAL users can set a local password.");
        this.props.passwordHash = hash;
    }
    suspend() {
        this.props.status = enums_1.UserStatus.SUSPENDED;
    }
    activate() { this.props.status = enums_1.UserStatus.ACTIVE; }
    changeEmail(email) {
        this.props.email = email;
    }
    markSynced(at) { this.props.lastSyncedAt = at; }
    upgradeToDirectoryUser(p) {
        if (p.type === enums_1.UserType.APPLICANT)
            throw new domain_error_1.InvariantViolationError("A directory record cannot turn someone into an applicant.");
        this.props.type = p.type;
        this.props.institutionalNumber = p.institutionalNumber;
        if (p.name)
            this.props.name = p.name;
        if (p.email)
            this.props.email = p.email;
        if (p.phone)
            this.props.phone = p.phone;
        if (p.departmentId)
            this.props.departmentId = p.departmentId;
        this.props.applicantPurpose = undefined;
        this.props.lastSyncedAt = p.syncedAt;
    }
    get type() { return this.props.type; }
    applyDirectoryUpdate(p, syncedAt) {
        if (p.name)
            this.props.name = p.name;
        if (p.email)
            this.props.email = p.email;
        if (p.departmentId)
            this.props.departmentId = p.departmentId;
        this.props.lastSyncedAt = syncedAt;
    }
    toAuthenticated() {
        return {
            id: this.id.toString(),
            email: this.props.email.value,
            status: this.props.status,
            authProvider: this.props.authProvider,
        };
    }
    snapshot() {
        return {
            type: this.props.type,
            fullNameAr: this.props.name.ar,
            fullNameEn: this.props.name.en,
            email: this.props.email.value,
            phone: this.props.phone,
            institutionalNumber: this.props.institutionalNumber?.value,
            passwordHash: this.props.passwordHash,
            authProvider: this.props.authProvider,
            applicantPurpose: this.props.applicantPurpose,
            departmentId: this.props.departmentId?.toString(),
            preferredLang: this.props.preferredLang,
            status: this.props.status,
            lastSyncedAt: this.props.lastSyncedAt,
        };
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map