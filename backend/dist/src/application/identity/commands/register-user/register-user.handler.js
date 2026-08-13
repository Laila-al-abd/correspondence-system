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
var RegisterUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const user_1 = require("../../../../domain/identity/user");
const enums_1 = require("../../../../domain/identity/enums");
const email_1 = require("../../../../domain/identity/value-objects/email");
const person_name_1 = require("../../../../domain/identity/value-objects/person-name");
const tokens_1 = require("../../../tokens");
const user_type_attribute_writer_1 = require("../../services/user-type-attribute.writer");
const register_user_command_1 = require("./register-user.command");
let RegisterUserHandler = RegisterUserHandler_1 = class RegisterUserHandler {
    users;
    hasher;
    ids;
    transaction;
    userTypeAttribute;
    logger = new common_1.Logger(RegisterUserHandler_1.name);
    constructor(users, hasher, ids, transaction, userTypeAttribute) {
        this.users = users;
        this.hasher = hasher;
        this.ids = ids;
        this.transaction = transaction;
        this.userTypeAttribute = userTypeAttribute;
    }
    async execute({ input }) {
        const email = email_1.Email.create(input.email);
        if (await this.users.findByEmail(email)) {
            this.logger.warn(`Registration attempt for an address that already exists: ${email.value}`);
            return { accepted: true };
        }
        const name = person_name_1.PersonName.create(input.fullNameAr, input.fullNameEn);
        const passwordHash = await this.hasher.hash(input.password);
        const user = user_1.User.create(this.ids.next(), {
            type: enums_1.UserType.APPLICANT,
            name,
            email,
            phone: input.phone,
            institutionalNumber: undefined,
            passwordHash,
            authProvider: 'LOCAL',
            applicantPurpose: input.applicantPurpose,
            departmentId: undefined,
            preferredLang: input.preferredLang ?? 'ar',
            status: enums_1.UserStatus.ACTIVE,
        });
        await this.transaction.run(async () => {
            await this.users.save(user);
            await this.userTypeAttribute.write(user.id, user.type);
        });
        return { accepted: true };
    }
};
exports.RegisterUserHandler = RegisterUserHandler;
exports.RegisterUserHandler = RegisterUserHandler = RegisterUserHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(register_user_command_1.RegisterUserCommand),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.PASSWORD_HASHER)),
    __param(2, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(3, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, user_type_attribute_writer_1.UserTypeAttributeWriter])
], RegisterUserHandler);
//# sourceMappingURL=register-user.handler.js.map