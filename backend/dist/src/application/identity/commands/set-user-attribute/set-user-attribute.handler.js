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
exports.SetUserAttributeHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const enums_1 = require("../../../../domain/catalog/enums");
const identifier_1 = require("../../../../domain/shared/identifier");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const set_user_attribute_command_1 = require("./set-user-attribute.command");
let SetUserAttributeHandler = class SetUserAttributeHandler {
    users;
    attributes;
    userAttributes;
    constructor(users, attributes, userAttributes) {
        this.users = users;
        this.attributes = attributes;
        this.userAttributes = userAttributes;
    }
    async execute({ input, }) {
        const userId = identifier_1.Identifier.of(input.userId);
        if (!(await this.users.findById(userId)))
            throw new errors_1.EntityNotFoundError('User', input.userId);
        const attribute = await this.attributes.findByCode(input.attributeCode);
        if (!attribute)
            throw new errors_1.EntityNotFoundError('Attribute', input.attributeCode);
        this.assertValueMatchesType(attribute, input.value);
        await this.userAttributes.setValue({
            userId,
            attributeId: attribute.id,
            value: input.value,
        });
        return {
            userId: input.userId,
            attributeCode: input.attributeCode,
            value: input.value,
        };
    }
    assertValueMatchesType(attribute, value) {
        const dataType = attribute.dataType;
        const fail = (expected) => {
            throw new domain_error_1.InvariantViolationError(`Attribute value must be a ${expected} for data type ${dataType}.`);
        };
        switch (dataType) {
            case enums_1.AttributeDataType.NUMBER:
                if (typeof value !== 'number' || Number.isNaN(value))
                    fail('number');
                break;
            case enums_1.AttributeDataType.BOOLEAN:
                if (typeof value !== 'boolean')
                    fail('boolean');
                break;
            case enums_1.AttributeDataType.DATE:
                if (typeof value !== 'string' || Number.isNaN(Date.parse(value)))
                    fail('date string');
                break;
            case enums_1.AttributeDataType.ENUM: {
                const reason = attribute.validate(value);
                if (reason !== null)
                    throw new domain_error_1.InvariantViolationError(reason);
                break;
            }
            case enums_1.AttributeDataType.TEXT:
            default:
                if (typeof value !== 'string')
                    fail('string');
                break;
        }
    }
};
exports.SetUserAttributeHandler = SetUserAttributeHandler;
exports.SetUserAttributeHandler = SetUserAttributeHandler = __decorate([
    (0, cqrs_1.CommandHandler)(set_user_attribute_command_1.SetUserAttributeCommand),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.USER_ATTRIBUTE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object])
], SetUserAttributeHandler);
//# sourceMappingURL=set-user-attribute.handler.js.map