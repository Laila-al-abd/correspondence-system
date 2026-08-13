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
exports.DefineWorkflowPathDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../domain/workflow/enums");
class LocalizedTextDto {
    ar;
    en;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], LocalizedTextDto.prototype, "ar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], LocalizedTextDto.prototype, "en", void 0);
class WorkflowStepDto {
    key;
    name;
    description;
    assigneeType;
    assigneeRoleId;
    assigneeDepartmentId;
    defaultActionTypeId;
    slaHours;
    pausesSla;
    feeAmount;
    feeCurrency;
    allowedActionTypeIds;
    dependsOn;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], WorkflowStepDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocalizedTextDto),
    __metadata("design:type", LocalizedTextDto)
], WorkflowStepDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocalizedTextDto),
    __metadata("design:type", LocalizedTextDto)
], WorkflowStepDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.AssigneeType),
    __metadata("design:type", String)
], WorkflowStepDto.prototype, "assigneeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowStepDto.prototype, "assigneeRoleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowStepDto.prototype, "assigneeDepartmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowStepDto.prototype, "defaultActionTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WorkflowStepDto.prototype, "slaHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowStepDto.prototype, "pausesSla", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], WorkflowStepDto.prototype, "feeAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], WorkflowStepDto.prototype, "feeCurrency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WorkflowStepDto.prototype, "allowedActionTypeIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WorkflowStepDto.prototype, "dependsOn", void 0);
class DefineWorkflowPathDto {
    templateId;
    name;
    description;
    steps;
    activate;
}
exports.DefineWorkflowPathDto = DefineWorkflowPathDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DefineWorkflowPathDto.prototype, "templateId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocalizedTextDto),
    __metadata("design:type", LocalizedTextDto)
], DefineWorkflowPathDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocalizedTextDto),
    __metadata("design:type", LocalizedTextDto)
], DefineWorkflowPathDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowStepDto),
    __metadata("design:type", Array)
], DefineWorkflowPathDto.prototype, "steps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DefineWorkflowPathDto.prototype, "activate", void 0);
//# sourceMappingURL=define-workflow-path.dto.js.map