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
exports.ListStepCandidatesHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const assignee_resolver_1 = require("../../services/assignee-resolver");
const list_step_candidates_query_1 = require("./list-step-candidates.query");
let ListStepCandidatesHandler = class ListStepCandidatesHandler {
    requests;
    workflowPaths;
    assignees;
    constructor(requests, workflowPaths, assignees) {
        this.requests = requests;
        this.workflowPaths = workflowPaths;
        this.assignees = assignees;
    }
    async execute(query) {
        const request = await this.requests.findById(identifier_1.Identifier.of(query.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', query.requestId);
        const step = request.stepInstances.find((si) => si.id.toString() === query.stepInstanceId);
        if (!step)
            throw new errors_1.EntityNotFoundError('Step instance', query.stepInstanceId);
        const stepSnapshot = step.snapshot();
        const base = {
            stepInstanceId: step.id.toString(),
            workflowStepId: stepSnapshot.workflowStepId,
            currentAssigneeUserId: stepSnapshot.assignedToUserId,
        };
        const pathId = request.workflowPathId;
        const path = pathId ? await this.workflowPaths.findById(pathId) : null;
        const definition = path?.steps.find((candidate) => candidate.id.toString() === stepSnapshot.workflowStepId);
        if (!definition)
            return { ...base, candidates: [], unrestricted: true };
        const definitionSnapshot = definition.snapshot();
        const { recommended, wider } = await this.assignees.assignableUsersForStep(definition, request.requesterId);
        const candidates = [
            ...recommended.map((c) => ({ ...c, recommended: true })),
            ...wider.map((c) => ({ ...c, recommended: false })),
        ];
        return {
            ...base,
            stepName: definitionSnapshot.name.ar || definitionSnapshot.name.en,
            assigneeType: definitionSnapshot.assigneeType,
            assigneeRoleId: definitionSnapshot.assigneeRoleId,
            candidates,
            unrestricted: candidates.length === 0,
        };
    }
};
exports.ListStepCandidatesHandler = ListStepCandidatesHandler;
exports.ListStepCandidatesHandler = ListStepCandidatesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_step_candidates_query_1.ListStepCandidatesQuery),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, assignee_resolver_1.AssigneeResolver])
], ListStepCandidatesHandler);
//# sourceMappingURL=list-step-candidates.handler.js.map