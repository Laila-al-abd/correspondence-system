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
exports.LocalAuthProvider = void 0;
const common_1 = require("@nestjs/common");
const email_1 = require("../../domain/identity/value-objects/email");
const enums_1 = require("../../domain/identity/enums");
const tokens_1 = require("../../application/tokens");
const errors_1 = require("../../application/errors");
let LocalAuthProvider = class LocalAuthProvider {
    users;
    hasher;
    key = 'LOCAL';
    constructor(users, hasher) {
        this.users = users;
        this.hasher = hasher;
    }
    async authenticate(credentials) {
        const email = email_1.Email.create(String(credentials.email ?? ''));
        const user = await this.users.findByEmail(email);
        if (!user || !user.hasLocalPassword()) {
            throw new errors_1.InvalidCredentialsError();
        }
        const ok = await this.hasher.compare(String(credentials.password ?? ''), user.passwordHash);
        if (!ok || user.status !== enums_1.UserStatus.ACTIVE) {
            throw new errors_1.InvalidCredentialsError();
        }
        return user.toAuthenticated();
    }
};
exports.LocalAuthProvider = LocalAuthProvider;
exports.LocalAuthProvider = LocalAuthProvider = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.PASSWORD_HASHER)),
    __metadata("design:paramtypes", [Object, Object])
], LocalAuthProvider);
//# sourceMappingURL=local-auth.provider.js.map