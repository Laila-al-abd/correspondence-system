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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaWorkflowPathRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../generated/prisma/client");
const domain_error_1 = require("../../domain/shared/domain-error");
const prisma_service_1 = require("../persistence/prisma.service");
const workflow_path_mapper_1 = require("./workflow-path.mapper");
let PrismaWorkflowPathRepository = class PrismaWorkflowPathRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.workflowPath.findFirst({
            where: { id: id.toString(), deletedAt: null },
            include: workflow_path_mapper_1.workflowPathInclude,
        });
        return row ? workflow_path_mapper_1.WorkflowPathMapper.toDomain(row) : null;
    }
    async findActiveByTemplate(templateId) {
        const row = await this.prisma.workflowPath.findFirst({
            where: {
                templateId: templateId.toString(),
                isActive: true,
                deletedAt: null,
            },
            include: workflow_path_mapper_1.workflowPathInclude,
            orderBy: { id: 'asc' },
        });
        return row ? workflow_path_mapper_1.WorkflowPathMapper.toDomain(row) : null;
    }
    async listByTemplate(templateId) {
        const rows = await this.prisma.workflowPath.findMany({
            where: { templateId: templateId.toString(), deletedAt: null },
            include: workflow_path_mapper_1.workflowPathInclude,
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => workflow_path_mapper_1.WorkflowPathMapper.toDomain(row));
    }
    async save(path) {
        const root = workflow_path_mapper_1.WorkflowPathMapper.toRoot(path);
        const id = path.id.toString();
        const snapshot = path.snapshot();
        await this.prisma.$transaction(async (tx) => {
            await tx.workflowPath.upsert({
                where: { id },
                create: root,
                update: root,
            });
            const existing = await tx.workflowStep.findMany({
                where: { workflowPathId: id },
                select: { id: true },
            });
            const existingIds = existing.map((s) => s.id);
            if (existingIds.length) {
                const inUse = await tx.requestStepInstance.findFirst({
                    where: { workflowStepId: { in: existingIds } },
                    select: { id: true },
                });
                if (inUse)
                    throw new domain_error_1.InvariantViolationError('This workflow path is already in use by one or more requests and ' +
                        'can no longer be edited. Define a new path for the template and ' +
                        'activate it instead -- the old path stays in place for the ' +
                        'requests that started on it.');
                await tx.workflowStepDependency.deleteMany({
                    where: {
                        OR: [
                            { workflowStepId: { in: existingIds } },
                            { dependsOnStepId: { in: existingIds } },
                        ],
                    },
                });
                await tx.workflowStepAllowedAction.deleteMany({
                    where: { workflowStepId: { in: existingIds } },
                });
                await tx.workflowStep.deleteMany({ where: { workflowPathId: id } });
            }
            for (const step of snapshot.steps) {
                await tx.workflowStep.create({
                    data: {
                        id: step.id,
                        workflowPathId: id,
                        name: step.name,
                        description: step.description
                            ? step.description
                            : client_1.Prisma.JsonNull,
                        assigneeType: step.assigneeType,
                        assigneeRoleId: step.assigneeRoleId
                            ? step.assigneeRoleId
                            : null,
                        assigneeDepartmentId: step.assigneeDepartmentId
                            ? step.assigneeDepartmentId
                            : null,
                        defaultActionTypeId: step.defaultActionTypeId
                            ? step.defaultActionTypeId
                            : null,
                        slaHours: step.slaHours ?? null,
                        pausesSla: step.pausesSla,
                        feeAmount: step.feeAmount ?? null,
                        feeCurrency: step.feeCurrency ?? null,
                    },
                });
            }
            for (const step of snapshot.steps) {
                const stepId = step.id;
                if (step.allowedActionTypeIds.length) {
                    await tx.workflowStepAllowedAction.createMany({
                        data: step.allowedActionTypeIds.map((actionTypeId) => ({
                            workflowStepId: stepId,
                            actionTypeId: actionTypeId,
                        })),
                        skipDuplicates: true,
                    });
                }
                if (step.dependsOnStepIds.length) {
                    await tx.workflowStepDependency.createMany({
                        data: step.dependsOnStepIds.map((dependsOnStepId) => ({
                            workflowStepId: stepId,
                            dependsOnStepId: dependsOnStepId,
                        })),
                        skipDuplicates: true,
                    });
                }
            }
        });
    }
    async setActive(id, isActive) {
        await this.prisma.workflowPath.update({
            where: { id: id.toString() },
            data: { isActive },
        });
    }
    async activateExclusively(templateId, pathId) {
        await this.prisma.$transaction(async (tx) => {
            await tx.workflowPath.updateMany({
                where: {
                    templateId: templateId.toString(),
                    isActive: true,
                    id: { not: pathId.toString() },
                },
                data: { isActive: false },
            });
            await tx.workflowPath.update({
                where: { id: pathId.toString() },
                data: { isActive: true },
            });
        });
    }
};
exports.PrismaWorkflowPathRepository = PrismaWorkflowPathRepository;
exports.PrismaWorkflowPathRepository = PrismaWorkflowPathRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaWorkflowPathRepository);
//# sourceMappingURL=prisma-workflow-path.repository.js.map