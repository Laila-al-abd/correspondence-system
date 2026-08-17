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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAttributeDefinitionDto = exports.CreateAttributeOptionDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../domain/catalog/enums");
class CreateAttributeOptionDto {
    value;
    labelAr;
    labelEn;
    ordinal;
}
exports.CreateAttributeOptionDto = CreateAttributeOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateAttributeOptionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateAttributeOptionDto.prototype, "labelAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateAttributeOptionDto.prototype, "labelEn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAttributeOptionDto.prototype, "ordinal", void 0);
class CreateAttributeDefinitionDto {
    code;
    labelAr;
    labelEn;
    dataType;
    descriptionAr;
    descriptionEn;
    options;
}
exports.CreateAttributeDefinitionDto = CreateAttributeDefinitionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z][a-z0-9_]{1,49}$/, {
        message: 'code must be 2-50 characters of lowercase letters, digits and underscores, starting with a letter',
    }),
    __metadata("design:type", String)
], CreateAttributeDefinitionDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateAttributeDefinitionDto.prototype, "labelAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateAttributeDefinitionDto.prototype, "labelEn", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.AttributeDataType),
    __metadata("design:type", String)
], CreateAttributeDefinitionDto.prototype, "dataType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1000),
    __metadata("design:type", String)
], CreateAttributeDefinitionDto.prototype, "descriptionAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1000),
    __metadata("design:type", String)
], CreateAttributeDefinitionDto.prototype, "descriptionEn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(50),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAttributeOptionDto),
    __metadata("design:type", Array)
], CreateAttributeDefinitionDto.prototype, "options", void 0);
//# sourceMappingURL=create-attribute-definition.dto.js.map