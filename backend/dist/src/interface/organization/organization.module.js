"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_department_repository_1 = require("../../infrastructure/organization/prisma-department.repository");
const prisma_org_unit_type_repository_1 = require("../../infrastructure/organization/prisma-org-unit-type.repository");
const http_personnel_directory_1 = require("../../infrastructure/organization/http-personnel-directory");
const prisma_department_query_1 = require("../../infrastructure/organization/prisma-department-query");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const sync_departments_from_directory_1 = require("../../application/organization/sync-departments-from-directory");
const sync_departments_handler_1 = require("../../application/organization/commands/sync-departments/sync-departments.handler");
const create_department_handler_1 = require("../../application/organization/commands/create-department/create-department.handler");
const update_department_handler_1 = require("../../application/organization/commands/update-department/update-department.handler");
const list_org_unit_types_handler_1 = require("../../application/organization/queries/list-org-unit-types/list-org-unit-types.handler");
const tokens_1 = require("../../application/tokens");
const organization_controller_1 = require("./organization.controller");
let OrganizationModule = class OrganizationModule {
};
exports.OrganizationModule = OrganizationModule;
exports.OrganizationModule = OrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [organization_controller_1.OrganizationController],
        providers: [
            sync_departments_handler_1.SyncDepartmentsHandler,
            create_department_handler_1.CreateDepartmentHandler,
            update_department_handler_1.UpdateDepartmentHandler,
            list_org_unit_types_handler_1.ListOrgUnitTypesHandler,
            { provide: tokens_1.DEPARTMENT_REPOSITORY, useClass: prisma_department_repository_1.PrismaDepartmentRepository },
            { provide: tokens_1.DEPARTMENT_QUERY, useClass: prisma_department_query_1.PrismaDepartmentQuery },
            {
                provide: tokens_1.ORG_UNIT_TYPE_REPOSITORY,
                useClass: prisma_org_unit_type_repository_1.PrismaOrgUnitTypeRepository,
            },
            { provide: tokens_1.PERSONNEL_DIRECTORY, useClass: http_personnel_directory_1.HttpPersonnelDirectory },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
            {
                provide: sync_departments_from_directory_1.SyncDepartmentsFromDirectory,
                useFactory: (directory, departments, unitTypes, ids, transaction) => new sync_departments_from_directory_1.SyncDepartmentsFromDirectory(directory, departments, unitTypes, ids, transaction),
                inject: [
                    tokens_1.PERSONNEL_DIRECTORY,
                    tokens_1.DEPARTMENT_REPOSITORY,
                    tokens_1.ORG_UNIT_TYPE_REPOSITORY,
                    tokens_1.ID_GENERATOR,
                    tokens_1.TRANSACTION_RUNNER,
                ],
            },
        ],
        exports: [tokens_1.DEPARTMENT_REPOSITORY, tokens_1.ORG_UNIT_TYPE_REPOSITORY, tokens_1.PERSONNEL_DIRECTORY],
    })
], OrganizationModule);
//# sourceMappingURL=organization.module.js.map