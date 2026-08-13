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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const define_workflow_path_command_1 = require("../../application/workflow/commands/define-workflow-path/define-workflow-path.command");
const activate_workflow_path_command_1 = require("../../application/workflow/commands/activate-workflow-path/activate-workflow-path.command");
const deactivate_workflow_path_command_1 = require("../../application/workflow/commands/deactivate-workflow-path/deactivate-workflow-path.command");
const get_workflow_path_query_1 = require("../../application/workflow/queries/get-workflow-path/get-workflow-path.query");
const list_workflow_paths_query_1 = require("../../application/workflow/queries/list-workflow-paths/list-workflow-paths.query");
const define_workflow_path_dto_1 = require("./dto/define-workflow-path.dto");
const permissions_decorator_1 = require("../identity/permissions.decorator");
let WorkflowController = class WorkflowController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    listByTemplate(templateId) {
        return this.queryBus.execute(new list_workflow_paths_query_1.ListWorkflowPathsByTemplateQuery(templateId));
    }
    get(id) {
        return this.queryBus.execute(new get_workflow_path_query_1.GetWorkflowPathQuery(id));
    }
    define(dto) {
        return this.commandBus.execute(new define_workflow_path_command_1.DefineWorkflowPathCommand(dto));
    }
    activate(id) {
        return this.commandBus.execute(new activate_workflow_path_command_1.ActivateWorkflowPathCommand(id));
    }
    deactivate(id) {
        return this.commandBus.execute(new deactivate_workflow_path_command_1.DeactivateWorkflowPathCommand(id));
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "listByTemplate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [define_workflow_path_dto_1.DefineWorkflowPathDto]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "define", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "deactivate", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, common_1.Controller)('workflow-paths'),
    (0, permissions_decorator_1.RequirePermissions)('workflow.manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map