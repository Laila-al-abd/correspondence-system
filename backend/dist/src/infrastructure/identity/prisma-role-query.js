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
exports.PrismaRoleQuery = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const withCounts = {
    _count: { select: { permissions: true, userRoles: true } },
};
const withPermissions = {
    _count: { select: { permissions: true, userRoles: true } },
    permissions: { include: { permission: true } },
};
let PrismaRoleQuery = class PrismaRoleQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listRoles() {
        const rows = await this.prisma.role.findMany({
            where: { deletedAt: null },
            include: withCounts,
            orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
        });
        return rows.map((row) => toSummary(row));
    }
    async getRole(id) {
        const row = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
            include: withPermissions,
        });
        if (!row)
            return null;
        return {
            ...toSummary(row),
            permissions: row.permissions
                .map((rp) => toPermission(rp.permission))
                .sort((a, b) => a.code.localeCompare(b.code)),
        };
    }
    async listPermissionGroups() {
        const groups = await this.prisma.permissionGroup.findMany({
            include: { permissions: { orderBy: { code: 'asc' } } },
            orderBy: { id: 'asc' },
        });
        return groups.map((group) => ({
            id: group.id,
            name: text(group.name),
            description: optionalText(group.description),
            permissions: group.permissions.map((permission) => toPermission(permission)),
        }));
    }
};
exports.PrismaRoleQuery = PrismaRoleQuery;
exports.PrismaRoleQuery = PrismaRoleQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRoleQuery);
const text = (value) => value;
const optionalText = (value) => (value === null ? null : text(value));
function toSummary(row) {
    return {
        id: row.id.toString(),
        name: text(row.name),
        description: optionalText(row.description),
        isSystem: row.isSystem,
        permissionCount: row._count.permissions,
        assignmentCount: row._count.userRoles,
        createdAt: row.createdAt.toISOString(),
    };
}
function toPermission(row) {
    return {
        id: row.id.toString(),
        code: row.code,
        name: text(row.name),
        description: optionalText(row.description),
    };
}
//# sourceMappingURL=prisma-role-query.js.map