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
exports.ClearUserAttributeHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const clear_user_attribute_command_1 = require("./clear-user-attribute.command");
let ClearUserAttributeHandler = class ClearUserAttributeHandler {
    attributes;
    userAttributes;
    constructor(attributes, userAttributes) {
        this.attributes = attributes;
        this.userAttributes = userAttributes;
    }
    async execute({ input }) {
        const attribute = await this.attributes.findByCode(input.attributeCode);
        if (!attribute)
            throw new errors_1.EntityNotFoundError('Attribute', input.attributeCode);
        await this.userAttributes.clear({
            userId: identifier_1.Identifier.of(input.userId),
            attributeId: attribute.id,
        });
    }
};
exports.ClearUserAttributeHandler = ClearUserAttributeHandler;
exports.ClearUserAttributeHandler = ClearUserAttributeHandler = __decorate([
    (0, cqrs_1.CommandHandler)(clear_user_attribute_command_1.ClearUserAttributeCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.USER_ATTRIBUTE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], ClearUserAttributeHandler);
//# sourceMappingURL=clear-user-attribute.handler.js.map