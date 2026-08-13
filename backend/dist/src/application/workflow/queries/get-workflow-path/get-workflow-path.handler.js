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
exports.GetWorkflowPathHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const get_workflow_path_query_1 = require("./get-workflow-path.query");
const workflow_path_view_1 = require("../views/workflow-path.view");
let GetWorkflowPathHandler = class GetWorkflowPathHandler {
    workflowPaths;
    constructor(workflowPaths) {
        this.workflowPaths = workflowPaths;
    }
    async execute({ workflowPathId, }) {
        const path = await this.workflowPaths.findById(identifier_1.Identifier.of(workflowPathId));
        if (!path)
            throw new errors_1.EntityNotFoundError('WorkflowPath', workflowPathId);
        return (0, workflow_path_view_1.toWorkflowPathView)(path);
    }
};
exports.GetWorkflowPathHandler = GetWorkflowPathHandler;
exports.GetWorkflowPathHandler = GetWorkflowPathHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_workflow_path_query_1.GetWorkflowPathQuery),
    __param(0, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetWorkflowPathHandler);
//# sourceMappingURL=get-workflow-path.handler.js.map