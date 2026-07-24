import { Prisma } from '../../../generated/prisma/client'
import { RequestContextStore } from '../shared/request-context'

/*
 * One consistent rule: a table that records WHEN a row changed (created_at /
 * updated_at) also records WHO changed it (created_by / updated_by). These sets
 * mirror exactly the columns added by the audit-stamping migration, so the
 * extension never sends Prisma an argument for a column that does not exist.
 */
const CREATED_BY_MODELS = new Set<string>([
  'User',
  'AttributeDefinition',
  'UserAttribute',
  'Role',
  'PermissionGroup',
  'Permission',
  'RolePermission',
  'Delegation',
  'OrgUnitType',
  'Department',
  'Language',
  'SensitivityLevel',
  'RequestCategory',
  'Template',
  'TemplateField',
  'TemplateFieldOption',
  'TemplateEligibilityRule',
  'ActionType',
  'WorkflowPath',
  'WorkflowStep',
  'WorkflowStepAllowedAction',
  'WorkflowStepDependency',
  'Request',
  'RequestStepInstance',
  'RequestAction',
  'Payment',
  'AcademicCalendar',
  'Notification',
  'MlPrediction',
  'SystemSetting',
])

const UPDATED_BY_MODELS = new Set<string>([
  'User',
  'AttributeDefinition',
  'UserAttribute',
  'Role',
  'PermissionGroup',
  'Permission',
  'Delegation',
  'OrgUnitType',
  'Department',
  'Language',
  'SensitivityLevel',
  'RequestCategory',
  'Template',
  'TemplateField',
  'TemplateFieldOption',
  'TemplateEligibilityRule',
  'ActionType',
  'WorkflowPath',
  'WorkflowStep',
  'Request',
  'RequestStepInstance',
  'Payment',
  'AcademicCalendar',
  'Notification',
  'SystemSetting',
  'RequestNumberSequence',
])

type WriteArgs = { data?: unknown; create?: unknown; update?: unknown }

/** The current user as a BigInt id, or undefined when there is no request user. */
function currentActor(): bigint | undefined {
  const userId = RequestContextStore.userId()
  if (!userId) return undefined
  try {
    return BigInt(userId)
  } catch {
    return undefined
  }
}

/** Returns a copy of `data` with each field set to `actor`, unless already set. */
function stamp(data: unknown, actor: bigint, fields: readonly string[]): unknown {
  const row: Record<string, unknown> =
    data && typeof data === 'object' && !Array.isArray(data)
      ? { ...(data as Record<string, unknown>) }
      : {}
  for (const field of fields) {
    if (row[field] === undefined) row[field] = actor
  }
  return row
}

/** Applies `stamp` to a single row or every row of a createMany payload. */
function stampAll(data: unknown, actor: bigint, fields: readonly string[]): unknown {
  if (Array.isArray(data)) return data.map((row) => stamp(row, actor, fields))
  return stamp(data, actor, fields)
}

/** Which "who" columns a fresh insert of `model` should fill. */
function insertFields(model: string): string[] {
  const fields: string[] = []
  if (CREATED_BY_MODELS.has(model)) fields.push('createdBy')
  if (UPDATED_BY_MODELS.has(model)) fields.push('updatedBy')
  return fields
}

/**
 * Automatic audit stamping.
 *
 * A Prisma client extension that fills created_by on inserts and updated_by on
 * inserts and updates, taking the user from the AsyncLocalStorage request
 * context. Repositories, mappers, and the domain stay completely unaware: there
 * is no audit argument to pass around and it is impossible to forget. Writes
 * made outside a request (seeds, background jobs) leave the columns null, and
 * any value a caller sets explicitly is always respected.
 */
export const auditStampingExtension = Prisma.defineExtension({
  name: 'audit-stamping',
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const actor = currentActor()
        if (actor !== undefined) {
          const fields = insertFields(model)
          if (fields.length > 0) {
            const a = args as WriteArgs
            a.data = stamp(a.data, actor, fields)
          }
        }
        return query(args)
      },
      async createMany({ model, args, query }) {
        const actor = currentActor()
        if (actor !== undefined) {
          const fields = insertFields(model)
          const a = args as WriteArgs
          if (fields.length > 0 && a.data !== undefined) {
            a.data = stampAll(a.data, actor, fields)
          }
        }
        return query(args)
      },
      async update({ model, args, query }) {
        const actor = currentActor()
        if (actor !== undefined && UPDATED_BY_MODELS.has(model)) {
          const a = args as WriteArgs
          a.data = stamp(a.data, actor, ['updatedBy'])
        }
        return query(args)
      },
      async updateMany({ model, args, query }) {
        const actor = currentActor()
        if (actor !== undefined && UPDATED_BY_MODELS.has(model)) {
          const a = args as WriteArgs
          a.data = stamp(a.data, actor, ['updatedBy'])
        }
        return query(args)
      },
      async upsert({ model, args, query }) {
        const actor = currentActor()
        if (actor !== undefined) {
          const a = args as WriteArgs
          const createFields = insertFields(model)
          if (createFields.length > 0) {
            a.create = stamp(a.create, actor, createFields)
          }
          if (UPDATED_BY_MODELS.has(model)) {
            a.update = stamp(a.update, actor, ['updatedBy'])
          }
        }
        return query(args)
      },
    },
  },
})
