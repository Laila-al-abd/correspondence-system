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
var UserTypeAttributeWriter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypeAttributeWriter = exports.USER_TYPE_ATTRIBUTE_CODE = void 0;
const common_1 = require("@nestjs/common");
const tokens_1 = require("../../tokens");
exports.USER_TYPE_ATTRIBUTE_CODE = 'user_type';
let UserTypeAttributeWriter = UserTypeAttributeWriter_1 = class UserTypeAttributeWriter {
    attributes;
    userAttributes;
    logger = new common_1.Logger(UserTypeAttributeWriter_1.name);
    constructor(attributes, userAttributes) {
        this.attributes = attributes;
        this.userAttributes = userAttributes;
    }
    async write(userId, userType) {
        const attribute = await this.attributes.findByCode(exports.USER_TYPE_ATTRIBUTE_CODE);
        if (!attribute) {
            this.logger.warn(`No '${exports.USER_TYPE_ATTRIBUTE_CODE}' attribute definition exists, so ` +
                `user ${userId.toString()} was created without one. Eligibility ` +
                'rules that reference it will deny this user until the seed runs.');
            return;
        }
        await this.userAttributes.setValue({
            userId,
            attributeId: attribute.id,
            value: String(userType),
        });
    }
};
exports.UserTypeAttributeWriter = UserTypeAttributeWriter;
exports.UserTypeAttributeWriter = UserTypeAttributeWriter = UserTypeAttributeWriter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.USER_ATTRIBUTE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], UserTypeAttributeWriter);
//# sourceMappingURL=user-type-attribute.writer.js.map