"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveRole = exports.activeRoleAssignment = void 0;
const activeRoleAssignment = (now) => ({
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
});
exports.activeRoleAssignment = activeRoleAssignment;
exports.liveRole = { deletedAt: null };
//# sourceMappingURL=role-access.where.js.map