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
exports.PrismaRoleRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const role_mapper_1 = require("./role.mapper");
const role_access_where_1 = require("./role-access.where");
let PrismaRoleRepository = class PrismaRoleRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.role.findFirst({
            where: { id: id.toString(), deletedAt: null },
            include: { permissions: { include: { permission: true } } },
        });
        if (!row)
            return null;
        const codes = row.permissions.map((rp) => rp.permission.code);
        return role_mapper_1.RoleMapper.toDomain(row, codes);
    }
    async save(role) {
        const data = role_mapper_1.RoleMapper.toPersistence(role);
        const roleId = role.id.toString();
        const codes = role.permissions;
        await this.prisma.$transaction(async (tx) => {
            await tx.role.upsert({
                where: { id: roleId },
                create: data,
                update: data,
            });
            const permissions = codes.length
                ? await tx.permission.findMany({ where: { code: { in: codes } } })
                : [];
            await tx.rolePermission.deleteMany({ where: { roleId } });
            if (permissions.length) {
                await tx.rolePermission.createMany({
                    data: permissions.map((p) => ({ roleId, permissionId: p.id })),
                    skipDuplicates: true,
                });
            }
        });
    }
    async effectivePermissions(userId) {
        const now = new Date();
        const rows = await this.prisma.rolePermission.findMany({
            where: {
                role: {
                    deletedAt: null,
                    userRoles: {
                        some: {
                            userId: userId.toString(),
                            ...(0, role_access_where_1.activeRoleAssignment)(now),
                        },
                    },
                },
            },
            include: { permission: true },
        });
        return new Set(rows.map((rp) => rp.permission.code));
    }
    async roleCarries(roleId, permissionCode) {
        const match = await this.prisma.rolePermission.findFirst({
            where: {
                roleId: roleId.toString(),
                role: role_access_where_1.liveRole,
                permission: { code: permissionCode },
            },
            select: { roleId: true },
        });
        return match !== null;
    }
    async countHoldersOf(permissionCode, options) {
        const excluded = options?.excludingUserId?.toString();
        const excludedRole = options?.excludingRoleId?.toString();
        const rows = await this.prisma.userRole.findMany({
            where: {
                ...(0, role_access_where_1.activeRoleAssignment)(new Date()),
                ...(excluded ? { userId: { not: excluded } } : {}),
                ...(excludedRole ? { roleId: { not: excludedRole } } : {}),
                role: {
                    ...role_access_where_1.liveRole,
                    permissions: { some: { permission: { code: permissionCode } } },
                },
                user: { deletedAt: null, status: 'ACTIVE' },
            },
            select: { userId: true },
            distinct: ['userId'],
        });
        return rows.length;
    }
    async unknownPermissionCodes(codes) {
        const wanted = [...new Set(codes)];
        if (wanted.length === 0)
            return [];
        const found = await this.prisma.permission.findMany({
            where: { code: { in: wanted } },
            select: { code: true },
        });
        const known = new Set(found.map((p) => p.code));
        return wanted.filter((code) => !known.has(code));
    }
    async countAssignments(roleId) {
        return this.prisma.userRole.count({
            where: { roleId: roleId.toString() },
        });
    }
    async assignToUser(params) {
        const where = {
            userId: params.userId.toString(),
            roleId: params.roleId.toString(),
            departmentId: params.departmentId
                ? params.departmentId.toString()
                : null,
        };
        await this.prisma.$transaction(async (tx) => {
            await tx.userRole.deleteMany({ where });
            await tx.userRole.create({
                data: {
                    ...where,
                    reason: params.reason ?? null,
                    expiresAt: params.expiresAt ?? null,
                    assignedBy: params.assignedBy
                        ? params.assignedBy.toString()
                        : null,
                },
            });
        });
    }
    async revokeFromUser(params) {
        await this.prisma.userRole.deleteMany({
            where: {
                userId: params.userId.toString(),
                roleId: params.roleId.toString(),
                departmentId: params.departmentId
                    ? params.departmentId.toString()
                    : null,
            },
        });
    }
};
exports.PrismaRoleRepository = PrismaRoleRepository;
exports.PrismaRoleRepository = PrismaRoleRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRoleRepository);
//# sourceMappingURL=prisma-role.repository.js.map