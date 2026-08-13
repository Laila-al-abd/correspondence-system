"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../application/tokens");
const prisma_workflow_path_repository_1 = require("../../infrastructure/workflow/prisma-workflow-path.repository");
const prisma_template_repository_1 = require("../../infrastructure/catalog/prisma-template.repository");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const define_workflow_path_handler_1 = require("../../application/workflow/commands/define-workflow-path/define-workflow-path.handler");
const activate_workflow_path_handler_1 = require("../../application/workflow/commands/activate-workflow-path/activate-workflow-path.handler");
const deactivate_workflow_path_handler_1 = require("../../application/workflow/commands/deactivate-workflow-path/deactivate-workflow-path.handler");
const get_workflow_path_handler_1 = require("../../application/workflow/queries/get-workflow-path/get-workflow-path.handler");
const list_workflow_paths_handler_1 = require("../../application/workflow/queries/list-workflow-paths/list-workflow-paths.handler");
const workflow_controller_1 = require("./workflow.controller");
const catalog_module_1 = require("../catalog/catalog.module");
const handlers = [
    define_workflow_path_handler_1.DefineWorkflowPathHandler,
    activate_workflow_path_handler_1.ActivateWorkflowPathHandler,
    deactivate_workflow_path_handler_1.DeactivateWorkflowPathHandler,
    get_workflow_path_handler_1.GetWorkflowPathHandler,
    list_workflow_paths_handler_1.ListWorkflowPathsByTemplateHandler,
];
let WorkflowModule = class WorkflowModule {
};
exports.WorkflowModule = WorkflowModule;
exports.WorkflowModule = WorkflowModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, catalog_module_1.CatalogModule],
        controllers: [workflow_controller_1.WorkflowController],
        providers: [
            ...handlers,
            {
                provide: tokens_1.WORKFLOW_PATH_REPOSITORY,
                useClass: prisma_workflow_path_repository_1.PrismaWorkflowPathRepository,
            },
            { provide: tokens_1.TEMPLATE_REPOSITORY, useClass: prisma_template_repository_1.PrismaTemplateRepository },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
        ],
        exports: [tokens_1.WORKFLOW_PATH_REPOSITORY],
    })
], WorkflowModule);
//# sourceMappingURL=workflow.module.js.map