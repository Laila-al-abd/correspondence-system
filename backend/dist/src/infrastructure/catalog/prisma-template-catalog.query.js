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
exports.PrismaTemplateCatalogQuery = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const catalogInclude = {
    fields: { include: { options: true } },
};
const text = (json) => (json ?? {});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let PrismaTemplateCatalogQuery = class PrismaTemplateCatalogQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter) {
        const rows = await this.prisma.template.findMany({
            where: {
                deletedAt: null,
                ...(filter?.onlyActive === false ? {} : { isActive: true }),
            },
            include: catalogInclude,
            orderBy: [{ code: 'asc' }, { id: 'asc' }],
        });
        return rows.map((row) => this.toView(row));
    }
    async findByIdOrCode(idOrCode) {
        const key = idOrCode.trim();
        const row = await this.prisma.template.findFirst({
            where: {
                deletedAt: null,
                ...(UUID.test(key)
                    ? { id: key }
                    : { code: key.toUpperCase() }),
            },
            include: catalogInclude,
        });
        return row ? this.toView(row) : null;
    }
    toView(row) {
        const title = text(row.title);
        const description = text(row.description);
        const fields = [...row.fields]
            .sort((a, b) => a.ordinal - b.ordinal)
            .map((field) => {
            const label = text(field.label);
            return {
                key: field.fieldKey,
                labelAr: label.ar ?? field.fieldKey,
                labelEn: label.en,
                dataType: field.dataType,
                isRequired: field.isRequired,
                ordinal: field.ordinal,
                extractionQuestion: field.extractionQuestion ?? undefined,
                options: [...field.options]
                    .sort((a, b) => a.ordinal - b.ordinal)
                    .map((option) => {
                    const optionLabel = text(option.label);
                    return {
                        value: option.value,
                        labelAr: optionLabel.ar ?? option.value,
                        labelEn: optionLabel.en,
                    };
                }),
            };
        });
        return {
            id: row.id,
            code: row.code ?? undefined,
            nameAr: title.ar ?? '',
            nameEn: title.en,
            descriptionAr: description.ar,
            descriptionEn: description.en,
            classifierDocument: row.classifierDocument ?? description.ar,
            categoryId: row.categoryId ?? undefined,
            sensitivityLevelId: row.sensitivityLevelId ?? undefined,
            defaultPriority: row.defaultPriority ? row.defaultPriority : undefined, isActive: row.isActive,
            updatedAt: row.updatedAt.toISOString(),
            fields,
        };
    }
};
exports.PrismaTemplateCatalogQuery = PrismaTemplateCatalogQuery;
exports.PrismaTemplateCatalogQuery = PrismaTemplateCatalogQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTemplateCatalogQuery);
//# sourceMappingURL=prisma-template-catalog.query.js.map