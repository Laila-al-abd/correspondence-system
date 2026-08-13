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
exports.AssignStepHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const assignee_resolver_1 = require("../../services/assignee-resolver");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const assign_step_command_1 = require("./assign-step.command");
let AssignStepHandler = class AssignStepHandler {
    requests;
    workflowPaths;
    directory;
    assignees;
    notifier;
    events;
    constructor(requests, workflowPaths, directory, assignees, notifier, events) {
        this.requests = requests;
        this.workflowPaths = workflowPaths;
        this.directory = directory;
        this.assignees = assignees;
        this.notifier = notifier;
        this.events = events;
    }
    async execute({ input }) {
        const request = await this.requests.findById(identifier_1.Identifier.of(input.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        const step = request.stepInstances.find((si) => si.id.toString() === input.stepInstanceId);
        if (!step)
            throw new errors_1.EntityNotFoundError('Step instance', input.stepInstanceId);
        await this.assertAssignable(request, step, input.assigneeUserId);
        step.assignTo(identifier_1.Identifier.of(input.assigneeUserId));
        await this.requests.save(request);
        await this.events.assigned({
            requestId: request.id.toString(),
            stepInstanceId: step.id.toString(),
        });
        await this.notifier.stepAssigned({
            assigneeUserId: input.assigneeUserId,
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
        });
        return {
            stepInstanceId: step.id.toString(),
            assignedToUserId: input.assigneeUserId,
        };
    }
    async assertAssignable(request, step, assigneeUserId) {
        if (assigneeUserId === request.requesterId.toString())
            throw new errors_1.ForbiddenActionError('A request cannot be assigned to the person who raised it.');
        if (!(await this.directory.isAssignable(assigneeUserId)))
            throw new errors_1.ForbiddenActionError('That user is not an active member of staff and cannot be given work.');
        const pathId = request.workflowPathId;
        if (!pathId)
            return;
        const path = await this.workflowPaths.findById(pathId);
        const workflowStepId = step.snapshot().workflowStepId;
        const definition = path?.steps.find((candidate) => candidate.id.toString() === workflowStepId);
        if (!definition)
            return;
        const { recommended, wider } = await this.assignees.assignableUsersForStep(definition, request.requesterId);
        const eligible = [...recommended, ...wider];
        if (eligible.length === 0)
            return;
        if (!eligible.some((candidate) => candidate.userId === assigneeUserId))
            throw new errors_1.ForbiddenActionError('That user does not hold the role this step requires. Assign it to ' +
                'someone eligible for the step, or change the step definition.');
    }
};
exports.AssignStepHandler = AssignStepHandler;
exports.AssignStepHandler = AssignStepHandler = __decorate([
    (0, cqrs_1.CommandHandler)(assign_step_command_1.AssignStepCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ASSIGNEE_DIRECTORY)),
    __metadata("design:paramtypes", [Object, Object, Object, assignee_resolver_1.AssigneeResolver,
        notification_emitter_1.NotificationEmitter,
        event_recorder_1.EventRecorder])
], AssignStepHandler);
//# sourceMappingURL=assign-step.handler.js.map