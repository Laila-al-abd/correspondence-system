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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const sync_departments_command_1 = require("../../application/organization/commands/sync-departments/sync-departments.command");
const sync_departments_dto_1 = require("./dto/sync-departments.dto");
const create_department_command_1 = require("../../application/organization/commands/create-department/create-department.command");
const create_department_dto_1 = require("./dto/create-department.dto");
const list_departments_dto_1 = require("./dto/list-departments.dto");
const list_org_unit_types_query_1 = require("../../application/organization/queries/list-org-unit-types/list-org-unit-types.query");
const tokens_1 = require("../../application/tokens");
const page_query_dto_1 = require("../shared/dto/page-query.dto");
const errors_1 = require("../../application/errors");
const permissions_decorator_1 = require("../identity/permissions.decorator");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let OrganizationController = class OrganizationController {
    commandBus;
    queryBus;
    departments;
    constructor(commandBus, queryBus, departments) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.departments = departments;
    }
    sync(dto) {
        return this.commandBus.execute(new sync_departments_command_1.SyncDepartmentsCommand(dto.source));
    }
    create(dto) {
        return this.commandBus.execute(new create_department_command_1.CreateDepartmentCommand({
            unitTypeCode: dto.unitTypeCode,
            name: dto.name,
            description: dto.description,
            parentId: dto.parentId,
        }));
    }
    list(dto) {
        return this.departments.list({
            search: dto.search,
            parentId: dto.parentId,
            activeOnly: dto.activeOnly === 'true',
            limit: (0, page_query_dto_1.toNumber)(dto.limit),
            offset: (0, page_query_dto_1.toNumber)(dto.offset),
        });
    }
    tree(activeOnly) {
        return this.departments.tree(activeOnly === 'true');
    }
    listUnitTypes() {
        return this.queryBus.execute(new list_org_unit_types_query_1.ListOrgUnitTypesQuery());
    }
    async getOne(id) {
        if (!UUID_PATTERN.test(id))
            throw new errors_1.EntityNotFoundError('Department', id);
        const found = await this.departments.getById(id);
        if (!found)
            throw new errors_1.EntityNotFoundError('Department', id);
        return found;
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_departments_dto_1.SyncDepartmentsDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_departments_dto_1.ListDepartmentsDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('tree'),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "tree", null);
__decorate([
    (0, common_1.Get)('unit-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "listUnitTypes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getOne", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, common_1.Controller)('organization/departments'),
    (0, permissions_decorator_1.RequirePermissions)('user.manage'),
    __param(2, (0, common_1.Inject)(tokens_1.DEPARTMENT_QUERY)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus, Object])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map