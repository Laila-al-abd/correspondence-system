/**
 * The identity used by work that no human started: background jobs, the seed,
 * and anything else running outside an HTTP request.
 *
 * Audit columns (created_by / updated_by) are foreign keys to users, so system
 * writes previously had to leave them NULL, which made "nobody" and "the
 * system" indistinguishable in the audit trail. A dedicated user row fixes
 * that: every row is attributable, and the account cannot be used to sign in
 * because it has no password hash and its status is INACTIVE.
 *
 * The id is a fixed seeded UUID (table 9 = users, row 0) so it is stable
 * across database resets. It is created by prisma/seed.ts.
 */
export const SYSTEM_USER_ID = '00000000-0000-7000-8000-000900000000'

/** Email of the system account, used only as its unique key. */
export const SYSTEM_USER_EMAIL = 'system@correspondence.local'
