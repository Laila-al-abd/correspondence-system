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
exports.UpdateTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../domain/request/enums");
class UpdateTemplateDto {
    code;
    categoryId;
    sensitivityLevelId;
    titleAr;
    titleEn;
    descriptionAr;
    descriptionEn;
    defaultPriority;
    classifierDocument;
    isActive;
}
exports.UpdateTemplateDto = UpdateTemplateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z][A-Za-z0-9_]{1,49}$/, {
        message: 'code must be 2-50 characters of letters, digits and underscores, starting with a letter',
    }),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "sensitivityLevelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "titleAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "titleEn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 2000),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "descriptionAr", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 2000),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "descriptionEn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.Priority),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "defaultPriority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 1000),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "classifierDocument", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTemplateDto.prototype, "isActive", void 0);
//# sourceMappingURL=update-template.dto.js.map