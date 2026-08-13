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
exports.StartRequestWorkflowHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const request_step_instance_1 = require("../../../../domain/request/request-step-instance");
const identifier_1 = require("../../../../domain/shared/identifier");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const request_stage_1 = require("../../queries/views/request-stage");
const start_request_workflow_command_1 = require("./start-request-workflow.command");
const assignee_resolver_1 = require("../../services/assignee-resolver");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const business_hours_service_1 = require("../../../observability/services/business-hours.service");
let StartRequestWorkflowHandler = class StartRequestWorkflowHandler {
    requests;
    workflowPaths;
    ids;
    assignees;
    notifier;
    businessHours;
    events;
    constructor(requests, workflowPaths, ids, assignees, notifier, businessHours, events) {
        this.requests = requests;
        this.workflowPaths = workflowPaths;
        this.ids = ids;
        this.assignees = assignees;
        this.notifier = notifier;
        this.businessHours = businessHours;
        this.events = events;
    }
    async execute(command) {
        const request = await this.requests.findById(identifier_1.Identifier.of(command.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', command.requestId);
        const templateId = request.templateId;
        if (!templateId)
            throw new domain_error_1.InvariantViolationError('Cannot start a workflow before the request is classified.');
        const path = await this.workflowPaths.findActiveByTemplate(templateId);
        if (!path)
            throw new errors_1.EntityNotFoundError('Active workflow path for template', templateId.toString());
        const startedAt = new Date();
        const entryStepIds = new Set(path.entrySteps().map((s) => s.id.toString()));
        const stepInstances = [];
        for (const step of path.steps) {
            const startsNow = entryStepIds.has(step.id.toString());
            const slaDueAt = startsNow && step.slaHours !== undefined
                ? await this.businessHours.addWorkingHours(startedAt, step.slaHours)
                : undefined;
            stepInstances.push(request_step_instance_1.RequestStepInstance.create(this.ids.next(), {
                requestId: request.id,
                workflowStepId: step.id,
                slaDueAt,
            }));
        }
        const assignments = await this.assignees.resolveForPath(path, request.requesterId, entryStepIds);
        let entryStepCount = 0;
        let assignedStepCount = 0;
        for (const instance of stepInstances) {
            if (!entryStepIds.has(instance.workflowStepId.toString()))
                continue;
            entryStepCount++;
            const assignee = assignments.get(instance.workflowStepId.toString());
            if (assignee) {
                instance.assignTo(assignee);
                assignedStepCount++;
            }
        }
        const stageBefore = (0, request_stage_1.stageOfRequest)(request);
        request.startWorkflow(path.id, stepInstances);
        await this.requests.save(request);
        await this.events.statusChanged({
            requestId: request.id.toString(),
            from: stageBefore,
            to: (0, request_stage_1.stageOfRequest)(request),
        });
        for (const instance of stepInstances) {
            if (!instance.assignedToUserId)
                continue;
            await this.events.assigned({
                requestId: request.id.toString(),
                stepInstanceId: instance.id.toString(),
            });
        }
        for (const instance of stepInstances) {
            const assignee = instance.assignedToUserId;
            if (!assignee)
                continue;
            if (!entryStepIds.has(instance.workflowStepId.toString()))
                continue;
            await this.notifier.stepAssigned({
                assigneeUserId: assignee.toString(),
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
            });
        }
        await this.notifier.requestStateChanged({
            userId: request.requesterId.toString(),
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
            status: request.status,
        });
        const unassignedStepCount = entryStepCount - assignedStepCount;
        if (unassignedStepCount > 0) {
            await this.notifier.stepAssignmentRequired({
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
                unassignedStepCount,
            });
        }
        return {
            id: request.id.toString(),
            workflowPathId: path.id.toString(),
            stepCount: stepInstances.length,
            assignedStepCount,
            unassignedStepCount,
        };
    }
};
exports.StartRequestWorkflowHandler = StartRequestWorkflowHandler;
exports.StartRequestWorkflowHandler = StartRequestWorkflowHandler = __decorate([
    (0, cqrs_1.CommandHandler)(start_request_workflow_command_1.StartRequestWorkflowCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object, assignee_resolver_1.AssigneeResolver,
        notification_emitter_1.NotificationEmitter,
        business_hours_service_1.BusinessHoursService,
        event_recorder_1.EventRecorder])
], StartRequestWorkflowHandler);
//# sourceMappingURL=start-request-workflow.handler.js.map