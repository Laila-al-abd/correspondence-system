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
exports.CreateDepartmentHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const department_1 = require("../../../../domain/organization/department");
const identifier_1 = require("../../../../domain/shared/identifier");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const create_department_command_1 = require("./create-department.command");
let CreateDepartmentHandler = class CreateDepartmentHandler {
    departments;
    unitTypes;
    ids;
    constructor(departments, unitTypes, ids) {
        this.departments = departments;
        this.unitTypes = unitTypes;
        this.ids = ids;
    }
    async execute({ input, }) {
        const unitType = await this.unitTypes.findByCode(input.unitTypeCode);
        if (!unitType)
            throw new errors_1.EntityNotFoundError('Org unit type', input.unitTypeCode);
        let parentId;
        if (input.parentId) {
            parentId = identifier_1.Identifier.of(input.parentId);
            if (!(await this.departments.findById(parentId)))
                throw new errors_1.EntityNotFoundError('Department', input.parentId);
        }
        const department = department_1.Department.create(this.ids.next(), {
            parentId,
            unitTypeId: unitType.id,
            name: localized_text_1.LocalizedText.create(input.name.ar, input.name.en),
            description: input.description
                ? localized_text_1.LocalizedText.create(input.description.ar, input.description.en)
                : undefined,
        });
        await this.departments.save(department);
        return { id: department.id.toString(), sourceSystem: 'MANUAL' };
    }
};
exports.CreateDepartmentHandler = CreateDepartmentHandler;
exports.CreateDepartmentHandler = CreateDepartmentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_department_command_1.CreateDepartmentCommand),
    __param(0, (0, common_1.Inject)(tokens_1.DEPARTMENT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ORG_UNIT_TYPE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object])
], CreateDepartmentHandler);
//# sourceMappingURL=create-department.handler.js.map