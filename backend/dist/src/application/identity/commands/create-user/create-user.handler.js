"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const user_1 = require("../../../../domain/identity/user");
const enums_1 = require("../../../../domain/identity/enums");
const email_1 = require("../../../../domain/identity/value-objects/email");
const person_name_1 = require("../../../../domain/identity/value-objects/person-name");
const institutional_number_1 = require("../../../../domain/identity/value-objects/institutional-number");
const identifier_1 = require("../../../../domain/shared/identifier");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const user_type_attribute_writer_1 = require("../../services/user-type-attribute.writer");
const create_user_command_1 = require("./create-user.command");
let CreateUserHandler = class CreateUserHandler {
    users;
    roles;
    departments;
    hasher;
    ids;
    transaction;
    userTypeAttribute;
    constructor(users, roles, departments, hasher, ids, transaction, userTypeAttribute) {
        this.users = users;
        this.roles = roles;
        this.departments = departments;
        this.hasher = hasher;
        this.ids = ids;
        this.transaction = transaction;
        this.userTypeAttribute = userTypeAttribute;
    }
    async execute({ input }) {
        if (input.userType === enums_1.UserType.APPLICANT)
            throw new domain_error_1.InvariantViolationError('Applicants register themselves; they are not created by an administrator.');
        const email = email_1.Email.create(input.email);
        const number = institutional_number_1.InstitutionalNumber.create(input.institutionalNumber);
        if (await this.users.findByEmail(email))
            throw new errors_1.EmailAlreadyInUseError(input.email);
        if (await this.users.findByInstitutionalNumber(number))
            throw new errors_1.InstitutionalNumberAlreadyInUseError(input.institutionalNumber);
        let departmentId;
        if (input.departmentId) {
            const department = await this.departments.findById(identifier_1.Identifier.of(input.departmentId));
            if (!department)
                throw new errors_1.EntityNotFoundError('Department', input.departmentId);
            departmentId = department.id;
        }
        if (input.roleId) {
            const role = await this.roles.findById(identifier_1.Identifier.of(input.roleId));
            if (!role)
                throw new errors_1.EntityNotFoundError('Role', input.roleId);
        }
        const user = user_1.User.create(this.ids.next(), {
            type: input.userType,
            name: person_name_1.PersonName.create(input.fullNameAr, input.fullNameEn),
            email,
            phone: input.phone,
            institutionalNumber: number,
            passwordHash: await this.hasher.hash(input.password),
            authProvider: 'LOCAL',
            departmentId,
            preferredLang: input.preferredLang ?? 'ar',
            status: enums_1.UserStatus.ACTIVE,
        });
        await this.transaction.run(async () => {
            await this.users.save(user);
            await this.userTypeAttribute.write(user.id, user.type);
            if (input.roleId)
                await this.roles.assignToUser({
                    userId: user.id,
                    roleId: identifier_1.Identifier.of(input.roleId),
                    assignedBy: identifier_1.Identifier.of(input.createdBy),
                });
        });
        return { id: user.id.toString(), institutionalNumber: number.value };
    }
};
exports.CreateUserHandler = CreateUserHandler;
exports.CreateUserHandler = CreateUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_user_command_1.CreateUserCommand),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.DEPARTMENT_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.PASSWORD_HASHER)),
    __param(4, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(5, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, user_type_attribute_writer_1.UserTypeAttributeWriter])
], CreateUserHandler);
//# sourceMappingURL=create-user.handler.js.map