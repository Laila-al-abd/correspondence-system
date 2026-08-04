import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import {
  PRIORITY_RANK,
  RequestStatus,
  SLA_RISK_RANK,
} from '../../domain/request/enums'
import type {
  ListRequestQueueInput,
  ListRequestsAssignedInput,
  ListRequestsByRequesterInput,
  RequestQueryPort,
} from '../../application/request/ports/request-query.port'
import { MIN_DURATION_SAMPLE_SIZE } from '../../application/request/ports/request-query.port'
import {
  DurationEstimateView,
  RequestSummaryView,
} from '../../application/request/queries/views/request.view'
import {
  KeysetPage,
  clampLimit,
  decodeCursor,
  encodeCursor,
} from '../../application/shared/pagination'
import { PrismaService } from '../persistence/prisma.service'
import { dbClient } from '../persistence/transaction-context'

/**
 * Prisma-backed read model for request lists.
 *
 * Two things are deliberate here.
 *
 * First, the SELECT lists columns. The write-side repository eager-loads step
 * instances, actions, documents and payments because commands need a whole
 * aggregate; a list screen needs fourteen scalar fields, so that is what is
 * fetched.
 *
 * Second, the queue is ordered by the database rather than in memory. It used
 * to load every open request and sort the array with Request.compareForQueue.
 * That cannot be paged: to know which rows belong on page one you must already
 * hold them all. The ordering is therefore expressed in SQL -- but generated
 * from the very same PRIORITY_RANK and SLA_RISK_RANK tables the domain
 * comparator uses, so the two cannot drift apart. Add a priority level to the
 * enum and both orderings learn it at once.
 */
@Injectable()
export class PrismaRequestQuery implements RequestQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return dbClient(this.prisma)
  }

  /**
   * Two questions, asked in order, and the second only if the first cannot be
   * answered honestly.
   *
   * 1. What did requests of this template actually take? `percentile_cont(0.5)`
   *    is Postgres's median; it is computed in the database because the
   *    alternative is shipping every completed duration to Node to sort them.
   *    Only rows that carry a duration are counted -- the column is nullable on
   *    purpose (every request completed before it existed, and any request whose
   *    measurement failed, has none), so counting rows instead of values would
   *    quietly divide by history that was never measured.
   *
   * 2. What is this template *allowed* to take? The sum of the active path's
   *    step SLAs, which an administrator set when they defined the workflow. It
   *    assumes the steps run one after another; where a path ever fans out, this
   *    over-states the budget rather than under-stating it, which is the safer
   *    direction for a figure shown to somebody who is waiting.
   *
   * Both casts to float8 are deliberate: `percentile_cont` and `SUM` over a
   * `Decimal` column arrive as Prisma Decimal objects otherwise, and Number()
   * on one of those is a quiet source of NaN.
   */
  async estimateDuration(
    templateId: string,
  ): Promise<DurationEstimateView | undefined> {
    const [observed] = await this.db.$queryRaw<
      Array<{ median: number | null; samples: bigint }>
    >(Prisma.sql`
      SELECT
        percentile_cont(0.5) WITHIN GROUP (
          ORDER BY business_duration_minutes
        )::float8 AS median,
        COUNT(business_duration_minutes) AS samples
      FROM requests
      WHERE template_id = ${templateId}::uuid
        AND current_status = ${RequestStatus.COMPLETED}
        AND business_duration_minutes IS NOT NULL
    `)

    const sampleSize = Number(observed?.samples ?? 0)
    const median = observed?.median
    if (sampleSize >= MIN_DURATION_SAMPLE_SIZE && median != null)
      return {
        minutes: Math.round(median),
        basis: 'OBSERVED',
        sampleSize,
      }

    const [declared] = await this.db.$queryRaw<Array<{ hours: number | null }>>(
      Prisma.sql`
        SELECT SUM(s.sla_hours)::float8 AS hours
        FROM workflow_steps s
        JOIN workflow_paths p ON p.id = s.workflow_path_id
        WHERE p.template_id = ${templateId}::uuid
          AND p.is_active = true
          AND p.deleted_at IS NULL
      `,
    )

    const hours = declared?.hours
    if (hours == null || hours <= 0) return undefined
    return { minutes: Math.round(hours * 60), basis: 'DECLARED', sampleSize }
  }

  async listByRequester(
    input: ListRequestsByRequesterInput,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.listNewestFirst(
      { requesterId: input.requesterId },
      input.limit,
      input.cursor,
    )
  }

  async listAssignedTo(
    input: ListRequestsAssignedInput,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.listNewestFirst(
      { stepInstances: { some: { assignedToUserId: input.userId } } },
      input.limit,
      input.cursor,
    )
  }

  /**
   * Both personal lists are ordered by id descending. That is not an arbitrary
   * key: ids are UUIDv7, whose leading bits are a timestamp, so descending id
   * is newest-first and the cursor is simply the last id seen. No extra column,
   * no extra index -- the primary key already provides the order.
   */
  private async listNewestFirst(
    where: Prisma.RequestWhereInput,
    rawLimit: number | undefined,
    cursor: string | undefined,
  ): Promise<KeysetPage<RequestSummaryView>> {
    const limit = clampLimit(rawLimit)
    const after = cursor ? decodeCursor<{ id: string }>(cursor) : null

    const rows = await this.db.request.findMany({
      where: after ? { AND: [where, { id: { lt: after.id } }] } : where,
      select: SUMMARY_SELECT,
      orderBy: { id: 'desc' },
      // One more than asked for: if it comes back, there is another page.
      // Cheaper and more honest than a second COUNT query, which would have
      // to be told the same filter and could disagree with it.
      take: limit + 1,
    })

    const page = rows.slice(0, limit)
    const last = page[page.length - 1]
    return {
      items: page.map(toSummary),
      limit,
      nextCursor:
        rows.length > limit && last ? encodeCursor({ id: last.id }) : null,
    }
  }

  async listQueue(
    input: ListRequestQueueInput,
  ): Promise<KeysetPage<RequestSummaryView>> {
    const limit = clampLimit(input.limit)
    const after = input.cursor ? decodeCursor<QueueCursor>(input.cursor) : null

    const priorityRank = rankCase('priority', PRIORITY_RANK)
    const riskRank = rankCase('sla_risk', SLA_RISK_RANK)
    // A request with no deadline sorts last, which is exactly what the domain
    // comparator says when it substitutes POSITIVE_INFINITY for a missing
    // slaDueAt. Postgres has a literal for that, so the rule survives the
    // translation instead of being re-invented as a NULLS LAST clause that a
    // later edit could quietly drop.
    const dueKey = Prisma.sql`COALESCE(sla_due_at, 'infinity'::timestamptz)`

    // Two optional narrowings, both of them for the AI service rather than for
    // staff. After a restart it has no memory of what it had already done, and
    // "classified but still empty" is exactly the set of requests whose
    // extraction never landed. Expressed as filters on the existing queue so
    // that recovery reuses the ordering and the paging instead of inventing a
    // second endpoint with its own idea of both.
    const classification = input.classificationStatus
      ? Prisma.sql`AND classification_status = ${input.classificationStatus}`
      : Prisma.empty
    // An extracted-nothing request stores {}, not NULL, once anything has
    // touched it -- so emptiness has to be tested both ways or the recovery
    // query silently misses half its own work.
    const filled =
      input.hasFilledData === undefined
        ? Prisma.empty
        : input.hasFilledData
          ? Prisma.sql`AND filled_data IS NOT NULL AND filled_data::text <> '{}'`
          : Prisma.sql`AND (filled_data IS NULL OR filled_data::text = '{}')`

    const keyset = after
      ? Prisma.sql`AND (
          ${priorityRank} < ${after.p}
          OR (${priorityRank} = ${after.p} AND ${riskRank} < ${after.r})
          OR (${priorityRank} = ${after.p} AND ${riskRank} = ${after.r}
              AND ${dueKey} > ${dueCursor(after.d)})
          OR (${priorityRank} = ${after.p} AND ${riskRank} = ${after.r}
              AND ${dueKey} = ${dueCursor(after.d)} AND id > ${after.i}::uuid)
        )`
      : Prisma.empty

    const rows = await this.db.$queryRaw<QueueRow[]>(Prisma.sql`
      SELECT id, reference_no, requester_id, template_id, workflow_path_id,
             classification_status, classification_confidence, classified_by,
             current_status, priority, sla_risk, sensitivity_level_id,
             sla_due_at, completed_at,
             ${priorityRank} AS priority_rank,
             ${riskRank} AS risk_rank,
             ${dueKey} AS due_key
        FROM requests
       WHERE current_status = ${input.status}
             ${classification}
             ${filled}
             ${keyset}
       ORDER BY priority_rank DESC, risk_rank DESC, due_key ASC, id ASC
       LIMIT ${limit + 1}
    `)

    const page = rows.slice(0, limit)
    const last = page[page.length - 1]
    return {
      items: page.map(toSummaryFromRaw),
      limit,
      nextCursor:
        rows.length > limit && last
          ? encodeCursor({
              p: Number(last.priority_rank),
              r: Number(last.risk_rank),
              d: last.due_key ? last.due_key.toISOString() : INFINITY,
              i: last.id,
            })
          : null,
    }
  }
}

/** The ordering key of the last row on the page just served. */
interface QueueCursor {
  p: number
  r: number
  d: string
  i: string
}

const INFINITY = 'infinity'

function dueCursor(value: string): Prisma.Sql {
  return value === INFINITY
    ? Prisma.sql`'infinity'::timestamptz`
    : Prisma.sql`${new Date(value)}::timestamptz`
}

/**
 * Turns a rank table into a CASE expression. The ranks are generated rather
 * than written out so that SQL ordering and Request.compareForQueue always
 * agree; ELSE -1 puts any value the enum does not know about at the very back
 * of the queue rather than silently in the middle of it.
 */
function rankCase(column: string, ranks: Record<string, number>): Prisma.Sql {
  const whens = Object.entries(ranks).map(
    ([value, rank]) => Prisma.sql`WHEN ${value} THEN ${Prisma.raw(String(rank))}`,
  )
  return Prisma.sql`(CASE ${Prisma.raw(column)} ${Prisma.join(whens, ' ')} ELSE -1 END)`
}

const SUMMARY_SELECT = {
  id: true,
  referenceNo: true,
  requesterId: true,
  templateId: true,
  workflowPathId: true,
  classificationStatus: true,
  classificationConfidence: true,
  classifiedBy: true,
  currentStatus: true,
  priority: true,
  slaRisk: true,
  sensitivityLevelId: true,
  slaDueAt: true,
  completedAt: true,
} satisfies Prisma.RequestSelect

type SummaryRow = {
  id: string
  referenceNo: string | null
  requesterId: string
  templateId: string | null
  workflowPathId: string | null
  classificationStatus: string
  classificationConfidence: Prisma.Decimal | null
  classifiedBy: string | null
  currentStatus: string
  priority: string
  slaRisk: string
  sensitivityLevelId: string | null
  slaDueAt: Date | null
  completedAt: Date | null
}

type QueueRow = {
  id: string
  reference_no: string | null
  requester_id: string
  template_id: string | null
  workflow_path_id: string | null
  classification_status: string
  classification_confidence: Prisma.Decimal | null
  classified_by: string | null
  current_status: string
  priority: string
  sla_risk: string
  sensitivity_level_id: string | null
  sla_due_at: Date | null
  completed_at: Date | null
  priority_rank: number
  risk_rank: number
  due_key: Date | null
}

function toSummary(row: SummaryRow): RequestSummaryView {
  return {
    id: row.id,
    referenceNo: row.referenceNo ?? undefined,
    requesterId: row.requesterId,
    templateId: row.templateId ?? undefined,
    workflowPathId: row.workflowPathId ?? undefined,
    classificationStatus: row.classificationStatus,
    classificationConfidence:
      row.classificationConfidence === null
        ? undefined
        : Number(row.classificationConfidence),
    classifiedBy: row.classifiedBy ?? undefined,
    currentStatus: row.currentStatus,
    priority: row.priority,
    slaRisk: row.slaRisk,
    sensitivityLevelId: row.sensitivityLevelId ?? undefined,
    slaDueAt: row.slaDueAt ? row.slaDueAt.toISOString() : undefined,
    completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
  }
}

function toSummaryFromRaw(row: QueueRow): RequestSummaryView {
  return toSummary({
    id: row.id,
    referenceNo: row.reference_no,
    requesterId: row.requester_id,
    templateId: row.template_id,
    workflowPathId: row.workflow_path_id,
    classificationStatus: row.classification_status,
    classificationConfidence: row.classification_confidence,
    classifiedBy: row.classified_by,
    currentStatus: row.current_status,
    priority: row.priority,
    slaRisk: row.sla_risk,
    sensitivityLevelId: row.sensitivity_level_id,
    slaDueAt: row.sla_due_at,
    completedAt: row.completed_at,
  })
}
