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
exports.DefineWorkflowPathHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const workflow_path_1 = require("../../../../domain/workflow/workflow-path");
const workflow_step_1 = require("../../../../domain/workflow/workflow-step");
const identifier_1 = require("../../../../domain/shared/identifier");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const define_workflow_path_command_1 = require("./define-workflow-path.command");
let DefineWorkflowPathHandler = class DefineWorkflowPathHandler {
    workflowPaths;
    templates;
    actionTypes;
    ids;
    constructor(workflowPaths, templates, actionTypes, ids) {
        this.workflowPaths = workflowPaths;
        this.templates = templates;
        this.actionTypes = actionTypes;
        this.ids = ids;
    }
    async execute({ input, }) {
        if (input.steps.length === 0)
            throw new domain_error_1.InvariantViolationError('A workflow path must have at least one step.');
        const templateId = identifier_1.Identifier.of(input.templateId);
        if (!(await this.templates.findById(templateId)))
            throw new errors_1.EntityNotFoundError('Template', input.templateId);
        this.assertUniqueKeys(input.steps.map((step) => step.key));
        await this.assertTerminalActions(input.steps);
        const path = workflow_path_1.WorkflowPath.create(this.ids.next(), {
            templateId,
            name: localized_text_1.LocalizedText.create(input.name.ar, input.name.en),
            description: input.description
                ? localized_text_1.LocalizedText.create(input.description.ar, input.description.en)
                : undefined,
        });
        const idByKey = new Map();
        const authored = input.steps.map((stepInput) => {
            const step = workflow_step_1.WorkflowStep.create(this.ids.next(), {
                name: localized_text_1.LocalizedText.create(stepInput.name.ar, stepInput.name.en),
                description: stepInput.description
                    ? localized_text_1.LocalizedText.create(stepInput.description.ar, stepInput.description.en)
                    : undefined,
                assigneeType: stepInput.assigneeType,
                assigneeRoleId: stepInput.assigneeRoleId
                    ? identifier_1.Identifier.of(stepInput.assigneeRoleId)
                    : undefined,
                assigneeDepartmentId: stepInput.assigneeDepartmentId
                    ? identifier_1.Identifier.of(stepInput.assigneeDepartmentId)
                    : undefined,
                defaultActionTypeId: stepInput.defaultActionTypeId
                    ? identifier_1.Identifier.of(stepInput.defaultActionTypeId)
                    : undefined,
                slaHours: stepInput.slaHours,
                pausesSla: stepInput.pausesSla,
                feeAmount: stepInput.feeAmount,
                feeCurrency: stepInput.feeCurrency,
            });
            for (const actionTypeId of stepInput.allowedActionTypeIds ?? [])
                step.allowAction(identifier_1.Identifier.of(actionTypeId));
            path.addStep(step);
            idByKey.set(stepInput.key, step.id);
            return { stepInput, step };
        });
        for (const { stepInput, step } of authored) {
            for (const dependencyKey of stepInput.dependsOn ?? []) {
                const dependencyId = idByKey.get(dependencyKey);
                if (!dependencyId)
                    throw new domain_error_1.InvariantViolationError(`Step '${stepInput.key}' depends on unknown step '${dependencyKey}'.`);
                step.dependOn(dependencyId);
            }
        }
        path.deactivate();
        await this.workflowPaths.save(path);
        if (input.activate) {
            path.activate();
            await this.workflowPaths.activateExclusively(templateId, path.id);
        }
        return {
            id: path.id.toString(),
            stepCount: path.steps.length,
            isActive: path.isActive,
        };
    }
    async assertTerminalActions(steps) {
        const ids = new Set();
        for (const step of steps) {
            if (step.defaultActionTypeId)
                ids.add(step.defaultActionTypeId);
            for (const id of step.allowedActionTypeIds ?? [])
                ids.add(id);
        }
        for (const id of ids) {
            const actionType = await this.actionTypes.findById(identifier_1.Identifier.of(id));
            if (!actionType)
                throw new errors_1.EntityNotFoundError('Action type', id);
            if (!actionType.isTerminal)
                throw new domain_error_1.InvariantViolationError(`Action type '${actionType.code}' does not end a step, so it cannot be allowed on one.`);
        }
    }
    assertUniqueKeys(keys) {
        const seen = new Set();
        for (const key of keys) {
            if (seen.has(key))
                throw new domain_error_1.InvariantViolationError(`Duplicate step key '${key}'.`);
            seen.add(key);
        }
    }
};
exports.DefineWorkflowPathHandler = DefineWorkflowPathHandler;
exports.DefineWorkflowPathHandler = DefineWorkflowPathHandler = __decorate([
    (0, cqrs_1.CommandHandler)(define_workflow_path_command_1.DefineWorkflowPathCommand),
    __param(0, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ACTION_TYPE_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DefineWorkflowPathHandler);
//# sourceMappingURL=define-workflow-path.handler.js.map