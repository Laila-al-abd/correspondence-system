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
exports.RequestReadAccessPolicy = void 0;
const common_1 = require("@nestjs/common");
const identifier_1 = require("../../../domain/shared/identifier");
const tokens_1 = require("../../tokens");
const errors_1 = require("../../errors");
let RequestReadAccessPolicy = class RequestReadAccessPolicy {
    roles;
    constructor(roles) {
        this.roles = roles;
    }
    async assertMayRead(callerId, requesterId) {
        if (callerId === requesterId)
            return;
        const permissions = await this.roles.effectivePermissions(identifier_1.Identifier.of(callerId));
        if (!permissions.has('request.read'))
            throw new errors_1.ForbiddenActionError('You may only view your own requests.');
    }
};
exports.RequestReadAccessPolicy = RequestReadAccessPolicy;
exports.RequestReadAccessPolicy = RequestReadAccessPolicy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], RequestReadAccessPolicy);
//# sourceMappingURL=request-read-access.policy.js.map