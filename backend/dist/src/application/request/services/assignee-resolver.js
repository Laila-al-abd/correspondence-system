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
exports.AssigneeResolver = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("../../../domain/workflow/enums");
const identifier_1 = require("../../../domain/shared/identifier");
const tokens_1 = require("../../tokens");
const MAX_DELEGATION_HOPS = 5;
let AssigneeResolver = class AssigneeResolver {
    directory;
    constructor(directory) {
        this.directory = directory;
    }
    async resolveForPath(path, requesterId, onlyStepIds) {
        const result = new Map();
        const localLoad = new Map();
        let cachedDeptId;
        const requesterDepartmentId = async () => {
            if (cachedDeptId === undefined)
                cachedDeptId = await this.directory.getUserDepartmentId(requesterId.toString());
            return cachedDeptId;
        };
        const delegations = await this.directory.findActiveDelegations(new Date());
        const requesterKey = requesterId.toString();
        for (const step of path.steps) {
            if (onlyStepIds && !onlyStepIds.has(step.id.toString()))
                continue;
            const candidates = await this.resolveCandidates(step, requesterId, requesterDepartmentId);
            if (candidates.length === 0)
                continue;
            let chosen;
            let bestLoad = Number.POSITIVE_INFINITY;
            for (const candidate of candidates) {
                const load = candidate.openStepCount + (localLoad.get(candidate.userId) ?? 0);
                if (load < bestLoad) {
                    bestLoad = load;
                    chosen = candidate.userId;
                }
            }
            if (chosen === undefined)
                continue;
            const owner = this.applyDelegation(chosen, delegations, requesterKey);
            result.set(step.id.toString(), identifier_1.Identifier.of(owner));
            localLoad.set(owner, (localLoad.get(owner) ?? 0) + 1);
        }
        return result;
    }
    async resolveCandidates(step, requesterId, requesterDepartmentId) {
        const snap = step.snapshot();
        const excludeUserId = requesterId.toString();
        switch (snap.assigneeType) {
            case enums_1.AssigneeType.SPECIFIC_ROLE:
                if (!snap.assigneeRoleId)
                    return [];
                return this.directory.findCandidates({
                    roleId: snap.assigneeRoleId,
                    departmentId: snap.assigneeDepartmentId,
                    preferDepartmentId: snap.assigneeDepartmentId
                        ? undefined
                        : ((await requesterDepartmentId()) ?? undefined),
                    requireScoped: false,
                    excludeUserId,
                });
            case enums_1.AssigneeType.SPECIFIC_UNIT:
                if (!snap.assigneeDepartmentId)
                    return [];
                return this.directory.findCandidates({
                    departmentId: snap.assigneeDepartmentId,
                    requireScoped: true,
                    excludeUserId,
                });
            case enums_1.AssigneeType.REQUESTER_DEPARTMENT_HEAD: {
                const departmentId = await requesterDepartmentId();
                if (!departmentId)
                    return [];
                return this.resolveUpwards(snap.assigneeRoleId, departmentId, excludeUserId);
            }
            case enums_1.AssigneeType.REQUESTER_FACULTY_DEAN: {
                const departmentId = await requesterDepartmentId();
                if (!departmentId)
                    return [];
                const facultyId = await this.directory.findFacultyId(departmentId);
                if (!facultyId)
                    return [];
                return this.resolveUpwards(snap.assigneeRoleId, facultyId, excludeUserId);
            }
            default:
                return [];
        }
    }
    async resolveUpwards(roleId, startDepartmentId, excludeUserId) {
        if (!roleId)
            return [];
        let currentId = startDepartmentId;
        const visited = new Set();
        while (currentId !== null) {
            if (visited.has(currentId))
                break;
            visited.add(currentId);
            const candidates = await this.directory.findCandidates({
                roleId,
                departmentId: currentId,
                requireScoped: true,
                excludeUserId,
            });
            if (candidates.length > 0)
                return candidates;
            currentId = await this.directory.getParentDepartmentId(currentId);
        }
        return [];
    }
    applyDelegation(userId, delegations, requesterId) {
        let current = userId;
        const visited = new Set([current]);
        for (let hop = 0; hop < MAX_DELEGATION_HOPS; hop++) {
            const next = delegations.get(current);
            if (next === undefined || visited.has(next))
                break;
            if (next === requesterId)
                break;
            visited.add(next);
            current = next;
        }
        return current;
    }
    async candidatesForStep(step, requesterId) {
        let cachedDeptId;
        const requesterDepartmentId = async () => {
            if (cachedDeptId === undefined)
                cachedDeptId = await this.directory.getUserDepartmentId(requesterId.toString());
            return cachedDeptId;
        };
        const candidates = await this.resolveCandidates(step, requesterId, requesterDepartmentId);
        if (candidates.length === 0)
            return [];
        const delegations = await this.directory.findActiveDelegations(new Date());
        const requesterKey = requesterId.toString();
        const byUser = new Map(candidates.map((candidate) => [candidate.userId, candidate]));
        for (const candidate of candidates) {
            const delegate = this.applyDelegation(candidate.userId, delegations, requesterKey);
            if (delegate !== candidate.userId && !byUser.has(delegate))
                byUser.set(delegate, {
                    userId: delegate,
                    openStepCount: candidate.openStepCount,
                });
        }
        return [...byUser.values()];
    }
    async assignableUsersForStep(step, requesterId) {
        const recommended = await this.candidatesForStep(step, requesterId);
        const roleId = step.snapshot().assigneeRoleId;
        if (!roleId)
            return { recommended, wider: [] };
        const holders = await this.directory.findRoleHolders({
            roleId,
            excludeUserId: requesterId.toString(),
        });
        const alreadyListed = new Set(recommended.map((c) => c.userId));
        return {
            recommended,
            wider: holders.filter((h) => !alreadyListed.has(h.userId)),
        };
    }
    async resolveOwnerForStep(step, requesterId) {
        let cachedDeptId;
        const requesterDepartmentId = async () => {
            if (cachedDeptId === undefined)
                cachedDeptId = await this.directory.getUserDepartmentId(requesterId.toString());
            return cachedDeptId;
        };
        const candidates = await this.resolveCandidates(step, requesterId, requesterDepartmentId);
        if (candidates.length === 0)
            return undefined;
        let chosen;
        let bestLoad = Number.POSITIVE_INFINITY;
        for (const candidate of candidates) {
            if (candidate.openStepCount < bestLoad) {
                bestLoad = candidate.openStepCount;
                chosen = candidate.userId;
            }
        }
        if (chosen === undefined)
            return undefined;
        const delegations = await this.directory.findActiveDelegations(new Date());
        return identifier_1.Identifier.of(this.applyDelegation(chosen, delegations, requesterId.toString()));
    }
    async currentDelegateFor(userId, requesterId) {
        const delegations = await this.directory.findActiveDelegations(new Date());
        return this.applyDelegation(userId, delegations, requesterId.toString());
    }
};
exports.AssigneeResolver = AssigneeResolver;
exports.AssigneeResolver = AssigneeResolver = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.ASSIGNEE_DIRECTORY)),
    __metadata("design:paramtypes", [Object])
], AssigneeResolver);
//# sourceMappingURL=assignee-resolver.js.map