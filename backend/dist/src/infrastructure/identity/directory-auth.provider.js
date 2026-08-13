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
var DirectoryAuthProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryAuthProvider = exports.DIRECTORY_PROVIDER_KEY = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const email_1 = require("../../domain/identity/value-objects/email");
const enums_1 = require("../../domain/identity/enums");
const tokens_1 = require("../../application/tokens");
const errors_1 = require("../../application/errors");
exports.DIRECTORY_PROVIDER_KEY = 'LDAP';
const DEMO_PASSWORD_KEY = 'DIRECTORY_DEMO_PASSWORD';
let DirectoryAuthProvider = DirectoryAuthProvider_1 = class DirectoryAuthProvider {
    users;
    config;
    key = exports.DIRECTORY_PROVIDER_KEY;
    logger = new common_1.Logger(DirectoryAuthProvider_1.name);
    constructor(users, config) {
        this.users = users;
        this.config = config;
    }
    async authenticate(credentials) {
        const shared = this.config.get(DEMO_PASSWORD_KEY);
        if (!shared) {
            this.logger.warn(`A directory sign-in was attempted but ${DEMO_PASSWORD_KEY} is not set; refusing.`);
            throw new errors_1.UnsupportedAuthMethodError(this.key);
        }
        const email = email_1.Email.create(String(credentials.email ?? ''));
        const user = await this.users.findByEmail(email);
        if (!user)
            throw new errors_1.InvalidCredentialsError();
        if (user.authProvider !== this.key)
            throw new errors_1.InvalidCredentialsError();
        if (user.status !== enums_1.UserStatus.ACTIVE)
            throw new errors_1.InvalidCredentialsError();
        if (String(credentials.password ?? '') !== shared)
            throw new errors_1.InvalidCredentialsError();
        return user.toAuthenticated();
    }
};
exports.DirectoryAuthProvider = DirectoryAuthProvider;
exports.DirectoryAuthProvider = DirectoryAuthProvider = DirectoryAuthProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], DirectoryAuthProvider);
//# sourceMappingURL=directory-auth.provider.js.map