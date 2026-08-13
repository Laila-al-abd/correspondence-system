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
exports.PrismaUserQuery = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
let PrismaUserQuery = class PrismaUserQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter) {
        const limit = Math.min(Math.max(filter.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
        const offset = Math.max(filter.offset ?? 0, 0);
        const where = { deletedAt: null };
        if (filter.userType)
            where.userType = filter.userType;
        if (filter.status)
            where.status = filter.status;
        if (filter.departmentId)
            where.departmentId = filter.departmentId;
        if (filter.search) {
            const contains = { contains: filter.search, mode: 'insensitive' };
            where.OR = [
                { fullNameAr: contains },
                { fullNameEn: contains },
                { email: contains },
                { institutionalNumber: contains },
            ];
        }
        const [total, rows] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                orderBy: { id: 'asc' },
                skip: offset,
                take: limit,
            }),
        ]);
        return { total, limit, offset, items: rows.map((row) => toSummary(row)) };
    }
    async getDetail(id) {
        const row = await this.prisma.user.findFirst({
            where: { id: id, deletedAt: null },
            include: {
                rolesAssigned: { include: { role: true } },
                attributes: { include: { attribute: true } },
            },
        });
        if (!row)
            return null;
        const roles = row.rolesAssigned
            .filter((ur) => !ur.role.deletedAt)
            .map((ur) => ({
            roleId: ur.roleId.toString(),
            roleName: toLocalized(ur.role.name) ?? { ar: '' },
            departmentId: ur.departmentId ? ur.departmentId.toString() : null,
            expiresAt: ur.expiresAt ? ur.expiresAt.toISOString() : null,
            assignedAt: ur.assignedAt.toISOString(),
        }));
        const attributes = row.attributes.map((ua) => ({
            attributeId: ua.attributeId.toString(),
            attributeCode: ua.attribute.code,
            value: ua.value,
        }));
        return {
            ...toSummary(row),
            applicantPurpose: row.applicantPurpose ?? null,
            roles,
            attributes,
        };
    }
};
exports.PrismaUserQuery = PrismaUserQuery;
exports.PrismaUserQuery = PrismaUserQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserQuery);
function toLocalized(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    const record = value;
    return { ar: record.ar ?? '', en: record.en };
}
function toSummary(row) {
    return {
        id: row.id.toString(),
        userType: row.userType,
        fullNameAr: row.fullNameAr,
        fullNameEn: row.fullNameEn ?? null,
        email: row.email,
        phone: row.phone ?? null,
        institutionalNumber: row.institutionalNumber ?? null,
        departmentId: row.departmentId ? row.departmentId.toString() : null,
        status: row.status,
        authProvider: row.authProvider,
        preferredLang: row.preferredLang,
        createdAt: row.createdAt.toISOString(),
    };
}
//# sourceMappingURL=prisma-user-query.js.map