import type { Prisma } from '../../../generated/prisma/client'

/**
 * Shared "is this role assignment still valid right now?" clause.
 *
 * Three separate queries need this rule -- the notification audience, the
 * effective-permission lookup, and the assignee directory. Written out by hand
 * in three places it is easy for them to drift apart, and drift here is
 * invisible: nobody gets an error, an expired assignment simply keeps working
 * in one code path and stops working in another.
 *
 * It is also the extension point for delegation. When delegated authority is
 * resolved (Session 4), the definition of "currently active" changes in one
 * file instead of four.
 *
 * Note the split: `expiresAt` lives on the assignment (user_roles), while the
 * soft-delete flag lives on the role itself (roles.deleted_at). They are two
 * different tables, so they are two different clauses -- see `liveRole`.
 */
export const activeRoleAssignment = (now: Date): Prisma.UserRoleWhereInput => ({
  OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
})

/** Companion clause: the role itself has not been soft-deleted. */
export const liveRole: Prisma.RoleWhereInput = { deletedAt: null }
