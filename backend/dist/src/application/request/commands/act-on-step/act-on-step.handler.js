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
exports.ActOnStepHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const request_action_1 = require("../../../../domain/request/request-action");
const payment_1 = require("../../../../domain/request/payment");
const money_1 = require("../../../../domain/request/value-objects/money");
const enums_1 = require("../../../../domain/request/enums");
const identifier_1 = require("../../../../domain/shared/identifier");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const business_hours_service_1 = require("../../../observability/services/business-hours.service");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const assignee_resolver_1 = require("../../services/assignee-resolver");
const request_stage_1 = require("../../queries/views/request-stage");
const act_on_step_command_1 = require("./act-on-step.command");
const REQUEST_PAYMENT_CODE = 'REQUEST_PAYMENT';
const TERMINAL_REQUEST_STATUSES = [
    enums_1.RequestStatus.COMPLETED,
    enums_1.RequestStatus.REJECTED,
    enums_1.RequestStatus.CANCELLED,
];
const REASSIGN_ON_RELEASE = process.env.WORKFLOW_REASSIGN_ON_RELEASE !== 'false';
let ActOnStepHandler = class ActOnStepHandler {
    requests;
    actions;
    payments;
    workflowPaths;
    actionTypes;
    ids;
    transactions;
    directory;
    assignees;
    notifier;
    businessHours;
    events;
    constructor(requests, actions, payments, workflowPaths, actionTypes, ids, transactions, directory, assignees, notifier, businessHours, events) {
        this.requests = requests;
        this.actions = actions;
        this.payments = payments;
        this.workflowPaths = workflowPaths;
        this.actionTypes = actionTypes;
        this.ids = ids;
        this.transactions = transactions;
        this.directory = directory;
        this.assignees = assignees;
        this.notifier = notifier;
        this.businessHours = businessHours;
        this.events = events;
    }
    async execute(command) {
        const { input } = command;
        const { request, step, statusBefore, handoffs, stalled } = await this.transactions.run(() => this.applyAction(command));
        const requesterId = request.requesterId.toString();
        await this.notifier.actionTaken({
            userId: requesterId,
            actorId: input.actorId,
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
            action: input.action,
        });
        if (request.status !== statusBefore) {
            await this.notifier.requestStateChanged({
                userId: requesterId,
                actorId: input.actorId,
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
                status: request.status,
            });
        }
        for (const handoff of handoffs) {
            await this.notifier.stepAssigned({
                assigneeUserId: handoff.assigneeUserId,
                actorId: input.actorId,
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
            });
        }
        if (stalled > 0) {
            await this.notifier.stepAssignmentRequired({
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
                unassignedStepCount: stalled,
                reason: 'the step reached its turn without a usable owner -- whoever it was ' +
                    'routed to is no longer active, and no replacement currently matches ' +
                    'the assignee rule',
            });
        }
        return {
            stepInstanceId: step.id.toString(),
            stepStatus: step.status,
            requestStatus: request.status,
        };
    }
    async assertTerminalActionType(actionTypeId) {
        const actionType = await this.actionTypes.findById(identifier_1.Identifier.of(actionTypeId));
        if (!actionType)
            throw new errors_1.EntityNotFoundError('Action type', actionTypeId);
        if (!actionType.isTerminal)
            throw new domain_error_1.InvariantViolationError(`Action type '${actionType.code}' does not end a step, so it cannot be applied to one.`);
    }
    async applyAction(command) {
        const { input } = command;
        const request = await this.requests.findById(identifier_1.Identifier.of(input.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        const step = request.stepInstances.find((si) => si.id.toString() === input.stepInstanceId);
        if (!step)
            throw new errors_1.EntityNotFoundError('Step instance', input.stepInstanceId);
        if (step.assignedToUserId?.toString() !== input.actorId)
            throw new errors_1.ForbiddenActionError('You can only act on steps assigned to you.');
        if (TERMINAL_REQUEST_STATUSES.includes(request.status))
            throw new errors_1.ForbiddenActionError(`This request is already ${request.status.toLowerCase()} and cannot be acted on.`);
        if (input.actionTypeId)
            await this.assertTerminalActionType(input.actionTypeId);
        const statusBefore = request.status;
        const stageBefore = (0, request_stage_1.stageOfRequest)(request);
        const path = await this.loadPath(request);
        const definition = path && this.definitionOf(path, step);
        switch (input.action) {
            case act_on_step_command_1.StepActionKind.START:
                if (path)
                    this.assertDependenciesSatisfied(request, step, path);
                step.start();
                if (definition?.fee)
                    await this.requestFee(request, step, definition, input.actorId);
                await this.events.stepStarted({
                    requestId: request.id.toString(),
                    stepInstanceId: step.id.toString(),
                    actorId: input.actorId,
                });
                break;
            case act_on_step_command_1.StepActionKind.COMPLETE:
                if (definition?.fee)
                    await this.assertFeeSettled(request, step);
                step.complete();
                await this.events.stepCompleted({
                    requestId: request.id.toString(),
                    stepInstanceId: step.id.toString(),
                    actorId: input.actorId,
                });
                break;
            case act_on_step_command_1.StepActionKind.REJECT:
                step.reject();
                for (const other of request.stepInstances) {
                    if (other.id.toString() === step.id.toString())
                        continue;
                    if (!other.isTerminal())
                        other.skip();
                }
                request.reject();
                break;
            case act_on_step_command_1.StepActionKind.SKIP:
                step.skip();
                break;
            default:
                throw new domain_error_1.InvariantViolationError(`Unknown step action "${input.action}".`);
        }
        const releases = path &&
            (input.action === act_on_step_command_1.StepActionKind.COMPLETE ||
                input.action === act_on_step_command_1.StepActionKind.SKIP)
            ? await this.releaseSuccessors(request, step, path, input.actorId)
            : { handoffs: [], stalled: 0 };
        if (input.actionTypeId) {
            const action = request_action_1.RequestAction.create(this.ids.next(), {
                requestId: request.id,
                actorId: identifier_1.Identifier.of(input.actorId),
                actionTypeId: identifier_1.Identifier.of(input.actionTypeId),
                requestStepInstanceId: step.id,
                comment: input.comment,
            });
            await this.actions.append(action);
            await this.events.actionTaken({
                requestId: request.id.toString(),
                actorId: input.actorId,
                actionTypeId: input.actionTypeId,
                stepInstanceId: step.id.toString(),
            });
        }
        if (request.status === enums_1.RequestStatus.IN_PROGRESS &&
            request.stepInstances.every((si) => si.isTerminal())) {
            request.complete();
            const startedAt = request.createdAt;
            const finishedAt = request.completedAt;
            if (startedAt && finishedAt) {
                try {
                    const hours = await this.businessHours.workingHoursBetween(startedAt, finishedAt);
                    request.recordBusinessDuration(hours * 60);
                }
                catch {
                }
            }
        }
        await this.requests.save(request);
        const stageAfter = (0, request_stage_1.stageOfRequest)(request);
        if (stageAfter !== stageBefore)
            await this.events.statusChanged({
                requestId: request.id.toString(),
                from: stageBefore,
                to: stageAfter,
                actorId: input.actorId,
            });
        return {
            request,
            step,
            statusBefore,
            handoffs: releases.handoffs,
            stalled: releases.stalled,
        };
    }
    async loadPath(request) {
        const pathId = request.snapshot().workflowPathId;
        if (!pathId)
            return undefined;
        return ((await this.workflowPaths.findById(identifier_1.Identifier.of(pathId))) ?? undefined);
    }
    definitionOf(path, step) {
        const workflowStepId = step.workflowStepId.toString();
        return path.steps.find((s) => s.id.toString() === workflowStepId);
    }
    dependencyMap(path) {
        const map = new Map();
        for (const s of path.steps)
            map.set(s.id.toString(), s.dependencyIds);
        return map;
    }
    assertDependenciesSatisfied(request, step, path) {
        if (step.status !== enums_1.StepInstanceStatus.PENDING)
            return;
        const stepId = step.id.toString();
        const ready = request.readySteps(this.dependencyMap(path));
        if (!ready.some((si) => si.id.toString() === stepId))
            throw new errors_1.ForbiddenActionError('This step cannot start until the steps it depends on are finished.');
    }
    async releaseSuccessors(request, step, path, actorId) {
        const map = this.dependencyMap(path);
        const finished = step.workflowStepId.toString();
        const now = new Date();
        const handoffs = [];
        let stalled = 0;
        for (const ready of request.readySteps(map)) {
            const waitedOnThisStep = (map.get(ready.workflowStepId.toString()) ?? []).includes(finished);
            if (!waitedOnThisStep)
                continue;
            const definition = this.definitionOf(path, ready);
            if (definition?.slaHours !== undefined)
                ready.scheduleSla(await this.businessHours.addWorkingHours(now, definition.slaHours));
            const before = ready.assignedToUserId?.toString();
            if (definition)
                await this.refreshOwnership(request, ready, definition);
            const after = ready.assignedToUserId?.toString();
            if (!after) {
                stalled++;
                continue;
            }
            if (after !== before)
                await this.events.assigned({
                    requestId: request.id.toString(),
                    stepInstanceId: ready.id.toString(),
                    actorId,
                });
            handoffs.push({
                assigneeUserId: after,
                stepInstanceId: ready.id.toString(),
                reassigned: after !== before,
            });
        }
        return { handoffs, stalled };
    }
    async refreshOwnership(request, ready, definition) {
        if (!REASSIGN_ON_RELEASE)
            return;
        const current = ready.assignedToUserId?.toString();
        try {
            if (current) {
                const usable = await this.directory.isAssignable(current);
                if (usable) {
                    const delegate = await this.assignees.currentDelegateFor(current, request.requesterId);
                    if (delegate !== current)
                        ready.assignTo(identifier_1.Identifier.of(delegate));
                    return;
                }
            }
            const fresh = await this.assignees.resolveOwnerForStep(definition, request.requesterId);
            if (!fresh)
                return;
            if (fresh.toString() === current)
                return;
            ready.assignTo(fresh);
        }
        catch {
        }
    }
    async feeFor(request, step) {
        const stepInstanceId = step.id.toString();
        const payments = await this.payments.listByRequest(request.id);
        return payments.find((p) => p.snapshot().requestStepInstanceId === stepInstanceId);
    }
    async requestFee(request, step, definition, actorId) {
        const fee = definition.fee;
        if (!fee)
            return;
        const existing = await this.feeFor(request, step);
        if (existing)
            return;
        const actor = identifier_1.Identifier.of(actorId);
        const payment = payment_1.Payment.request(this.ids.next(), {
            requestId: request.id,
            requestStepInstanceId: step.id,
            money: money_1.Money.create(fee.amount, fee.currency),
            requestedBy: actor,
        });
        await this.payments.save(payment);
        const actionType = await this.actionTypes.findByCode(REQUEST_PAYMENT_CODE);
        if (actionType) {
            await this.actions.append(request_action_1.RequestAction.create(this.ids.next(), {
                requestId: request.id,
                actorId: actor,
                actionTypeId: actionType.id,
                requestStepInstanceId: step.id,
                comment: `Fee requested: ${fee.amount} ${fee.currency}`,
            }));
        }
        await this.notifier.paymentRequested({
            userId: request.requesterId.toString(),
            actorId,
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
            amount: fee.amount,
            currency: fee.currency,
        });
    }
    async assertFeeSettled(request, step) {
        const payment = await this.feeFor(request, step);
        if (!payment)
            throw new errors_1.ForbiddenActionError("This step charges a fee that has not been raised yet. Start the step first.");
        if (!payment.isSettled())
            throw new errors_1.ForbiddenActionError("This step cannot be completed until its fee is confirmed or waived.");
    }
};
exports.ActOnStepHandler = ActOnStepHandler;
exports.ActOnStepHandler = ActOnStepHandler = __decorate([
    (0, cqrs_1.CommandHandler)(act_on_step_command_1.ActOnStepCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_ACTION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.PAYMENT_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __param(4, (0, common_1.Inject)(tokens_1.ACTION_TYPE_REPOSITORY)),
    __param(5, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(6, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __param(7, (0, common_1.Inject)(tokens_1.ASSIGNEE_DIRECTORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, assignee_resolver_1.AssigneeResolver,
        notification_emitter_1.NotificationEmitter,
        business_hours_service_1.BusinessHoursService,
        event_recorder_1.EventRecorder])
], ActOnStepHandler);
//# sourceMappingURL=act-on-step.handler.js.map