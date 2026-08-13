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
exports.ReorderTemplateFieldsDto = exports.UpsertTemplateFieldDto = exports.TemplateFieldDto = exports.TemplateFieldOptionDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../domain/catalog/enums");
class TemplateFieldOptionDto {
    value;
    labelAr;
    labelEn;
}
exports.TemplateFieldOptionDto = TemplateFieldOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], TemplateFieldOptionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], TemplateFieldOptionDto.prototype, "labelAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], TemplateFieldOptionDto.prototype, "labelEn", void 0);
class TemplateFieldDto {
    key;
    labelAr;
    labelEn;
    dataType;
    isRequired;
    extractionQuestion;
    options;
}
exports.TemplateFieldDto = TemplateFieldDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z][a-z0-9_]{1,49}$/, {
        message: 'key must be 2-50 characters of lowercase letters, digits and underscores, starting with a letter',
    }),
    __metadata("design:type", String)
], TemplateFieldDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], TemplateFieldDto.prototype, "labelAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], TemplateFieldDto.prototype, "labelEn", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.FieldDataType),
    __metadata("design:type", String)
], TemplateFieldDto.prototype, "dataType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TemplateFieldDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 500),
    __metadata("design:type", String)
], TemplateFieldDto.prototype, "extractionQuestion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TemplateFieldOptionDto),
    __metadata("design:type", Array)
], TemplateFieldDto.prototype, "options", void 0);
class UpsertTemplateFieldDto extends TemplateFieldDto {
    ordinal;
}
exports.UpsertTemplateFieldDto = UpsertTemplateFieldDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpsertTemplateFieldDto.prototype, "ordinal", void 0);
class ReorderTemplateFieldsDto {
    fieldKeys;
}
exports.ReorderTemplateFieldsDto = ReorderTemplateFieldsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReorderTemplateFieldsDto.prototype, "fieldKeys", void 0);
//# sourceMappingURL=template-field.dto.js.map