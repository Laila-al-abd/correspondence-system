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
exports.ActivateWorkflowPathHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const activate_workflow_path_command_1 = require("./activate-workflow-path.command");
let ActivateWorkflowPathHandler = class ActivateWorkflowPathHandler {
    workflowPaths;
    constructor(workflowPaths) {
        this.workflowPaths = workflowPaths;
    }
    async execute({ workflowPathId, }) {
        const path = await this.workflowPaths.findById(identifier_1.Identifier.of(workflowPathId));
        if (!path)
            throw new errors_1.EntityNotFoundError('WorkflowPath', workflowPathId);
        path.activate();
        await this.workflowPaths.activateExclusively(path.templateId, path.id);
        return { id: path.id.toString(), isActive: path.isActive };
    }
};
exports.ActivateWorkflowPathHandler = ActivateWorkflowPathHandler;
exports.ActivateWorkflowPathHandler = ActivateWorkflowPathHandler = __decorate([
    (0, cqrs_1.CommandHandler)(activate_workflow_path_command_1.ActivateWorkflowPathCommand),
    __param(0, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ActivateWorkflowPathHandler);
//# sourceMappingURL=activate-workflow-path.handler.js.map