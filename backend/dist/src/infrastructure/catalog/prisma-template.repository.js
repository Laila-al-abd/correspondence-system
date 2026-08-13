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
exports.PrismaTemplateRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const template_mapper_1 = require("./template.mapper");
let PrismaTemplateRepository = class PrismaTemplateRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.template.findFirst({
            where: { id: id.toString(), deletedAt: null },
            include: template_mapper_1.templateInclude,
        });
        return row ? template_mapper_1.TemplateMapper.toDomain(row) : null;
    }
    async findByCode(code) {
        const row = await this.prisma.template.findFirst({
            where: { code: code.trim().toUpperCase(), deletedAt: null },
            include: template_mapper_1.templateInclude,
        });
        return row ? template_mapper_1.TemplateMapper.toDomain(row) : null;
    }
    async listActive() {
        const rows = await this.prisma.template.findMany({
            where: { isActive: true, deletedAt: null },
            include: template_mapper_1.templateInclude,
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => template_mapper_1.TemplateMapper.toDomain(row));
    }
    async listByCategory(categoryId) {
        const rows = await this.prisma.template.findMany({
            where: { categoryId: categoryId.toString(), deletedAt: null },
            include: template_mapper_1.templateInclude,
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => template_mapper_1.TemplateMapper.toDomain(row));
    }
    async save(template) {
        const root = template_mapper_1.TemplateMapper.toRoot(template);
        const id = template.id.toString();
        const snapshot = template.snapshot();
        await this.prisma.$transaction(async (tx) => {
            await tx.template.upsert({
                where: { id },
                create: root,
                update: root,
            });
            await tx.templateField.deleteMany({ where: { templateId: id } });
            await tx.templateEligibilityRule.deleteMany({ where: { templateId: id } });
            for (const field of snapshot.fields) {
                await tx.templateField.create({
                    data: {
                        id: field.id,
                        templateId: id,
                        fieldKey: field.fieldKey,
                        label: field.label,
                        dataType: field.dataType,
                        isRequired: field.isRequired,
                        ordinal: field.ordinal,
                        extractionQuestion: field.extractionQuestion ?? null,
                        options: {
                            create: field.options.map((option) => ({
                                value: option.value,
                                label: option.label,
                                ordinal: option.ordinal,
                            })),
                        },
                    },
                });
            }
            for (const rule of snapshot.eligibilityRules) {
                await tx.templateEligibilityRule.create({
                    data: {
                        id: rule.id,
                        templateId: id,
                        attributeId: rule.attributeId,
                        operator: rule.operator,
                        value: rule.value,
                    },
                });
            }
        });
    }
};
exports.PrismaTemplateRepository = PrismaTemplateRepository;
exports.PrismaTemplateRepository = PrismaTemplateRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTemplateRepository);
//# sourceMappingURL=prisma-template.repository.js.map