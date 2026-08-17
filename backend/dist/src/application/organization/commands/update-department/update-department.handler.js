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
exports.UpdateDepartmentHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const identifier_1 = require("../../../../domain/shared/identifier");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const update_department_command_1 = require("./update-department.command");
let UpdateDepartmentHandler = class UpdateDepartmentHandler {
    departments;
    constructor(departments) {
        this.departments = departments;
    }
    async execute({ input, }) {
        if (!input.name && input.description === undefined)
            throw new domain_error_1.InvariantViolationError('Provide a name or a description to update.');
        const id = identifier_1.Identifier.of(input.id);
        const department = await this.departments.findById(id);
        if (!department)
            throw new errors_1.EntityNotFoundError('Department', input.id);
        if (input.name)
            department.rename(localized_text_1.LocalizedText.create(input.name.ar, input.name.en));
        if (input.description !== undefined)
            department.describe(input.description
                ? localized_text_1.LocalizedText.create(input.description.ar, input.description.en)
                : undefined);
        await this.departments.save(department);
        return { id: id.toString(), name: department.snapshot().name };
    }
};
exports.UpdateDepartmentHandler = UpdateDepartmentHandler;
exports.UpdateDepartmentHandler = UpdateDepartmentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_department_command_1.UpdateDepartmentCommand),
    __param(0, (0, common_1.Inject)(tokens_1.DEPARTMENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateDepartmentHandler);
//# sourceMappingURL=update-department.handler.js.map