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
exports.PrismaDepartmentQuery = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../application/shared/pagination");
const prisma_service_1 = require("../persistence/prisma.service");
let PrismaDepartmentQuery = class PrismaDepartmentQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter) {
        const limit = (0, pagination_1.clampLimit)(filter.limit);
        const offset = (0, pagination_1.clampOffset)(filter.offset);
        const where = { deletedAt: null };
        if (filter.activeOnly)
            where.isActive = true;
        if (filter.parentId)
            where.parentId = filter.parentId;
        if (filter.search) {
            const term = filter.search;
            where.OR = [
                { name: { path: ['ar'], string_contains: term } },
                { name: { path: ['en'], string_contains: term } },
            ];
        }
        const [total, rows] = await Promise.all([
            this.prisma.department.count({ where }),
            this.prisma.department.findMany({
                where,
                include: { unitType: true },
                orderBy: { id: 'asc' },
                skip: offset,
                take: limit,
            }),
        ]);
        return { total, limit, offset, items: rows.map((row) => toView(row)) };
    }
    async getById(id) {
        const row = await this.prisma.department.findFirst({
            where: { id: id, deletedAt: null },
            include: { unitType: true },
        });
        return row ? toView(row) : null;
    }
    async tree(activeOnly) {
        const where = { deletedAt: null };
        if (activeOnly)
            where.isActive = true;
        const rows = await this.prisma.department.findMany({
            where,
            include: { unitType: true },
            orderBy: { id: 'asc' },
        });
        const nodes = new Map();
        for (const row of rows)
            nodes.set(row.id.toString(), { ...toView(row), children: [] });
        const roots = [];
        for (const node of nodes.values()) {
            const parent = node.parentId ? nodes.get(node.parentId) : undefined;
            if (parent)
                parent.children.push(node);
            else
                roots.push(node);
        }
        return roots;
    }
};
exports.PrismaDepartmentQuery = PrismaDepartmentQuery;
exports.PrismaDepartmentQuery = PrismaDepartmentQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDepartmentQuery);
function toLocalized(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    const record = value;
    return { ar: record.ar ?? '', en: record.en };
}
function toView(row) {
    return {
        id: row.id.toString(),
        parentId: row.parentId ? row.parentId.toString() : null,
        unitType: {
            id: row.unitType.id.toString(),
            code: row.unitType.code,
            name: toLocalized(row.unitType.name) ?? { ar: '' },
        },
        name: toLocalized(row.name) ?? { ar: '' },
        description: toLocalized(row.description ?? null),
        isActive: row.isActive,
        sourceSystem: row.sourceSystem,
        externalId: row.externalId ?? null,
        lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
    };
}
//# sourceMappingURL=prisma-department-query.js.map