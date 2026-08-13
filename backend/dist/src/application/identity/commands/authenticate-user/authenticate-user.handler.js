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
exports.AuthenticateUserHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const authenticate_user_command_1 = require("./authenticate-user.command");
let AuthenticateUserHandler = class AuthenticateUserHandler {
    registry;
    tokens;
    constructor(registry, tokens) {
        this.registry = registry;
        this.tokens = tokens;
    }
    async execute(command) {
        const provider = this.registry.get(command.method);
        const user = await provider.authenticate(command.credentials);
        const issued = this.tokens.issue({ userId: user.id, email: user.email });
        return {
            accessToken: issued.accessToken,
            tokenType: issued.tokenType,
            expiresIn: issued.expiresIn,
            user: { id: user.id, email: user.email },
        };
    }
};
exports.AuthenticateUserHandler = AuthenticateUserHandler;
exports.AuthenticateUserHandler = AuthenticateUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(authenticate_user_command_1.AuthenticateUserCommand),
    __param(0, (0, common_1.Inject)(tokens_1.AUTH_PROVIDER_REGISTRY)),
    __param(1, (0, common_1.Inject)(tokens_1.ACCESS_TOKEN_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], AuthenticateUserHandler);
//# sourceMappingURL=authenticate-user.handler.js.map