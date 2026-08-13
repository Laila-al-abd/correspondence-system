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
exports.PrismaDelegationQuery = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../application/shared/pagination");
const prisma_service_1 = require("../persistence/prisma.service");
const withUsers = {
    delegator: true,
    delegate: true,
};
let PrismaDelegationQuery = class PrismaDelegationQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter) {
        const limit = (0, pagination_1.clampLimit)(filter.limit);
        const offset = (0, pagination_1.clampOffset)(filter.offset);
        const where = { deletedAt: null };
        if (filter.delegatorId)
            where.delegatorId = filter.delegatorId;
        if (filter.delegateId)
            where.delegateId = filter.delegateId;
        if (filter.activeOnly)
            where.isActive = true;
        if (filter.onDate) {
            const day = new Date(filter.onDate);
            where.startDate = { lte: day };
            where.endDate = { gte: day };
        }
        const [total, rows] = await Promise.all([
            this.prisma.delegation.count({ where }),
            this.prisma.delegation.findMany({
                where,
                include: withUsers,
                orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
                skip: offset,
                take: limit,
            }),
        ]);
        return { total, limit, offset, items: rows.map((row) => toView(row)) };
    }
    async getById(id) {
        const row = await this.prisma.delegation.findFirst({
            where: { id: id, deletedAt: null },
            include: withUsers,
        });
        return row ? toView(row) : null;
    }
};
exports.PrismaDelegationQuery = PrismaDelegationQuery;
exports.PrismaDelegationQuery = PrismaDelegationQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDelegationQuery);
function toView(row) {
    return {
        id: row.id.toString(),
        delegatorId: row.delegatorId.toString(),
        delegatorName: {
            ar: row.delegator.fullNameAr,
            en: row.delegator.fullNameEn ?? undefined,
        },
        delegateId: row.delegateId.toString(),
        delegateName: {
            ar: row.delegate.fullNameAr,
            en: row.delegate.fullNameEn ?? undefined,
        },
        startDate: row.startDate.toISOString().slice(0, 10),
        endDate: row.endDate.toISOString().slice(0, 10),
        isActive: row.isActive,
        reason: row.reason ?? null,
        createdAt: row.createdAt.toISOString(),
    };
}
//# sourceMappingURL=prisma-delegation-query.js.map