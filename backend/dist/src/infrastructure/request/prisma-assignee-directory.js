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
exports.PrismaAssigneeDirectory = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const role_access_where_1 = require("../identity/role-access.where");
const OPEN_STATUSES = ['PENDING', 'IN_PROGRESS', 'WAITING'];
const FACULTY_KIND = 'FACULTY';
let PrismaAssigneeDirectory = class PrismaAssigneeDirectory {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findCandidates(query) {
        const now = new Date();
        const conditions = [(0, role_access_where_1.activeRoleAssignment)(now)];
        if (query.roleId)
            conditions.push({ roleId: query.roleId });
        if (query.departmentId) {
            const dept = query.departmentId;
            conditions.push(query.requireScoped
                ? { departmentId: dept }
                : { OR: [{ departmentId: dept }, { departmentId: null }] });
        }
        const userWhere = {
            status: 'ACTIVE',
            deletedAt: null,
        };
        if (query.excludeUserId)
            userWhere.id = { not: query.excludeUserId };
        const holders = await this.prisma.userRole.findMany({
            where: { AND: conditions, user: userWhere },
            select: { userId: true, departmentId: true },
        });
        if (holders.length === 0)
            return [];
        const wantedDepartmentId = query.departmentId ?? query.preferDepartmentId ?? null;
        const scopedUserIds = new Set();
        const userIds = [];
        const seen = new Set();
        for (const holder of holders) {
            const id = holder.userId.toString();
            if (!seen.has(id)) {
                seen.add(id);
                userIds.push(id);
            }
            if (wantedDepartmentId !== null &&
                holder.departmentId !== null &&
                holder.departmentId.toString() === wantedDepartmentId)
                scopedUserIds.add(id);
        }
        const loads = await this.prisma.requestStepInstance.groupBy({
            by: ['assignedToUserId'],
            where: {
                assignedToUserId: { in: userIds },
                status: { in: OPEN_STATUSES },
            },
            _count: { _all: true },
        });
        const loadByUser = new Map();
        for (const row of loads)
            if (row.assignedToUserId !== null)
                loadByUser.set(row.assignedToUserId.toString(), row._count._all);
        const candidates = userIds.map((id) => ({
            userId: id,
            openStepCount: loadByUser.get(id) ?? 0,
            scoped: scopedUserIds.has(id),
        }));
        const scopedCandidates = candidates.filter((c) => c.scoped);
        const pool = scopedCandidates.length > 0 ? scopedCandidates : candidates;
        pool.sort((a, b) => {
            if (a.openStepCount !== b.openStepCount)
                return a.openStepCount - b.openStepCount;
            const ai = a.userId;
            const bi = b.userId;
            return ai < bi ? -1 : ai > bi ? 1 : 0;
        });
        return pool;
    }
    async findActiveDelegations(on) {
        const day = new Date(Date.UTC(on.getUTCFullYear(), on.getUTCMonth(), on.getUTCDate()));
        const rows = await this.prisma.delegation.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                startDate: { lte: day },
                endDate: { gte: day },
                delegate: { status: 'ACTIVE', deletedAt: null },
                delegator: { deletedAt: null },
            },
            select: { delegatorId: true, delegateId: true },
            orderBy: { createdAt: 'asc' },
        });
        const byDelegator = new Map();
        for (const row of rows)
            byDelegator.set(row.delegatorId.toString(), row.delegateId.toString());
        return byDelegator;
    }
    findRoleHolders(query) {
        return this.findCandidates({
            roleId: query.roleId,
            excludeUserId: query.excludeUserId,
        });
    }
    async isAssignable(userId) {
        const row = await this.prisma.user.findFirst({
            where: { id: userId, status: 'ACTIVE', deletedAt: null },
            select: { id: true },
        });
        return row !== null;
    }
    async getUserDepartmentId(userId) {
        const row = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            select: { departmentId: true },
        });
        return row && row.departmentId !== null ? row.departmentId.toString() : null;
    }
    async findFacultyId(departmentId) {
        let currentId = departmentId;
        const visited = new Set();
        while (currentId !== null) {
            const key = currentId.toString();
            if (visited.has(key))
                break;
            visited.add(key);
            const row = await this.prisma.department.findFirst({
                where: { id: currentId, deletedAt: null },
                include: { unitType: true },
            });
            if (!row)
                return null;
            if (row.unitType.code === FACULTY_KIND)
                return row.id.toString();
            currentId = row.parentId;
        }
        return null;
    }
    async getParentDepartmentId(departmentId) {
        const row = await this.prisma.department.findFirst({
            where: { id: departmentId, deletedAt: null },
            select: { parentId: true },
        });
        return row && row.parentId !== null ? row.parentId.toString() : null;
    }
};
exports.PrismaAssigneeDirectory = PrismaAssigneeDirectory;
exports.PrismaAssigneeDirectory = PrismaAssigneeDirectory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAssigneeDirectory);
//# sourceMappingURL=prisma-assignee-directory.js.map