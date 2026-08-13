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
exports.PrismaRequestQuery = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../generated/prisma/client");
const enums_1 = require("../../domain/request/enums");
const request_query_port_1 = require("../../application/request/ports/request-query.port");
const request_stage_1 = require("../../application/request/queries/views/request-stage");
const pagination_1 = require("../../application/shared/pagination");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const SLA_DUE_AT_SUBQUERY = client_1.Prisma.sql `
  (
    SELECT MIN(si.sla_due_at)
    FROM request_step_instances si
    WHERE si.request_id = r.id
      AND si.status IN ('PENDING', 'IN_PROGRESS', 'WAITING')
      AND si.sla_paused = false
      AND si.sla_due_at IS NOT NULL
  )
`;
const OUTSTANDING_PAYMENTS_SUBQUERY = client_1.Prisma.sql `
  (
    SELECT COUNT(*)::int
    FROM payments p
    WHERE p.request_id = r.id
      AND p.status = 'REQUIRED'
  )
`;
let PrismaRequestQuery = class PrismaRequestQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async estimateDuration(templateId) {
        const [observed] = await this.db.$queryRaw(client_1.Prisma.sql `
      SELECT
        percentile_cont(0.5) WITHIN GROUP (
          ORDER BY business_duration_minutes
        )::float8 AS median,
        COUNT(business_duration_minutes) AS samples
      FROM requests
      WHERE template_id = ${templateId}::uuid
        AND current_status = ${enums_1.RequestStatus.COMPLETED}
        AND business_duration_minutes IS NOT NULL
    `);
        const sampleSize = Number(observed?.samples ?? 0);
        const median = observed?.median;
        if (sampleSize >= request_query_port_1.MIN_DURATION_SAMPLE_SIZE && median != null)
            return {
                minutes: Math.round(median),
                basis: 'OBSERVED',
                sampleSize,
            };
        const [declared] = await this.db.$queryRaw(client_1.Prisma.sql `
        SELECT SUM(s.sla_hours)::float8 AS hours
        FROM workflow_steps s
        JOIN workflow_paths p ON p.id = s.workflow_path_id
        WHERE p.template_id = ${templateId}::uuid
          AND p.is_active = true
          AND p.deleted_at IS NULL
      `);
        const hours = declared?.hours;
        if (hours == null || hours <= 0)
            return undefined;
        return { minutes: Math.round(hours * 60), basis: 'DECLARED', sampleSize };
    }
    async listByRequester(input) {
        return this.listNewestFirst({ requesterId: input.requesterId }, input.limit, input.cursor);
    }
    async listAssignedTo(input) {
        if (input.readyOnly)
            return this.listReadyForUser(input.userId, input.limit, input.cursor);
        return this.listNewestFirst({ stepInstances: { some: { assignedToUserId: input.userId } } }, input.limit, input.cursor);
    }
    async listReadyForUser(userId, rawLimit, cursor) {
        const limit = (0, pagination_1.clampLimit)(rawLimit);
        const after = cursor ? (0, pagination_1.decodeCursor)(cursor) : null;
        const keyset = after
            ? client_1.Prisma.sql `AND r.id < ${after.id}::uuid`
            : client_1.Prisma.empty;
        const rows = await this.db.$queryRaw(client_1.Prisma.sql `
      SELECT r.id, r.reference_no, r.requester_id, r.template_id,
             r.workflow_path_id, r.classification_status,
             r.classification_confidence, r.classified_by, r.current_status,
             r.priority, r.sla_risk,
             ${SLA_DUE_AT_SUBQUERY} AS sla_due_at,
             ${OUTSTANDING_PAYMENTS_SUBQUERY} AS outstanding_payments,
             r.completed_at, r.confirmed_at
        FROM requests r
       WHERE EXISTS (
               SELECT 1
                 FROM request_step_instances si
                WHERE si.request_id = r.id
                  AND si.assigned_to_user_id = ${userId}::uuid
                  AND (
                    si.status = 'IN_PROGRESS'
                    OR (
                      si.status = 'PENDING'
                      AND NOT EXISTS (
                        SELECT 1
                          FROM workflow_step_dependencies d
                         WHERE d.workflow_step_id = si.workflow_step_id
                           AND NOT EXISTS (
                             SELECT 1
                               FROM request_step_instances dep
                              WHERE dep.request_id = r.id
                                AND dep.workflow_step_id = d.depends_on_step_id
                                AND dep.status IN ('DONE', 'SKIPPED')
                           )
                      )
                    )
                  )
             )
             ${keyset}
       ORDER BY r.id DESC
       LIMIT ${limit + 1}
    `);
        const page = rows.slice(0, limit);
        const last = page[page.length - 1];
        return {
            items: page.map(toSummaryFromRaw),
            limit,
            nextCursor: rows.length > limit && last ? (0, pagination_1.encodeCursor)({ id: last.id }) : null,
        };
    }
    async listNewestFirst(where, rawLimit, cursor) {
        const limit = (0, pagination_1.clampLimit)(rawLimit);
        const after = cursor ? (0, pagination_1.decodeCursor)(cursor) : null;
        const keyset = after
            ? client_1.Prisma.sql `AND r.id < ${after.id}::uuid`
            : client_1.Prisma.empty;
        let whereSql = client_1.Prisma.empty;
        if (where.requesterId) {
            whereSql = client_1.Prisma.sql `WHERE r.requester_id = ${where.requesterId}::uuid`;
        }
        else if (where.stepInstances?.some?.assignedToUserId) {
            whereSql = client_1.Prisma.sql `
        WHERE EXISTS (
          SELECT 1 FROM request_step_instances si
          WHERE si.request_id = r.id
            AND si.assigned_to_user_id = ${where.stepInstances.some.assignedToUserId}::uuid
        )
      `;
        }
        else {
            whereSql = client_1.Prisma.empty;
        }
        const rows = await this.db.$queryRaw(client_1.Prisma.sql `
      SELECT r.id, r.reference_no, r.requester_id, r.template_id,
             r.workflow_path_id, r.classification_status,
             r.classification_confidence, r.classified_by, r.current_status,
             r.priority, r.sla_risk,
             ${SLA_DUE_AT_SUBQUERY} AS sla_due_at,
             ${OUTSTANDING_PAYMENTS_SUBQUERY} AS outstanding_payments,
             r.completed_at, r.confirmed_at
        FROM requests r
        ${whereSql}
        ${keyset}
       ORDER BY r.id DESC
       LIMIT ${limit + 1}
    `);
        const page = rows.slice(0, limit);
        const last = page[page.length - 1];
        return {
            items: page.map(toSummaryFromRaw),
            limit,
            nextCursor: rows.length > limit && last ? (0, pagination_1.encodeCursor)({ id: last.id }) : null,
        };
    }
    async listQueue(input) {
        const limit = (0, pagination_1.clampLimit)(input.limit);
        const after = input.cursor ? (0, pagination_1.decodeCursor)(input.cursor) : null;
        const priorityRank = rankCase('priority', enums_1.PRIORITY_RANK);
        const riskRank = rankCase('sla_risk', enums_1.SLA_RISK_RANK);
        const dueKey = client_1.Prisma.sql `COALESCE(${SLA_DUE_AT_SUBQUERY}, 'infinity'::timestamptz)`;
        const classification = input.classificationStatus
            ? Array.isArray(input.classificationStatus)
                ? client_1.Prisma.sql `AND classification_status IN (${client_1.Prisma.join(input.classificationStatus)})`
                : client_1.Prisma.sql `AND classification_status = ${input.classificationStatus}`
            : client_1.Prisma.empty;
        const filled = input.hasFilledData === undefined
            ? client_1.Prisma.empty
            : input.hasFilledData
                ? client_1.Prisma.sql `AND filled_data IS NOT NULL AND filled_data::text <> '{}'`
                : client_1.Prisma.sql `AND (filled_data IS NULL OR filled_data::text = '{}')`;
        const extracted = input.extracted === undefined
            ? client_1.Prisma.empty
            : input.extracted
                ? client_1.Prisma.sql `AND extraction_attempted_at IS NOT NULL`
                : client_1.Prisma.sql `AND extraction_attempted_at IS NULL`;
        const keyset = after
            ? client_1.Prisma.sql `AND (
          ${priorityRank} < ${after.p}
          OR (${priorityRank} = ${after.p} AND ${riskRank} < ${after.r})
          OR (${priorityRank} = ${after.p} AND ${riskRank} = ${after.r}
              AND ${dueKey} > ${dueCursor(after.d)})
          OR (${priorityRank} = ${after.p} AND ${riskRank} = ${after.r}
              AND ${dueKey} = ${dueCursor(after.d)} AND id > ${after.i}::uuid)
        )`
            : client_1.Prisma.empty;
        const rows = await this.db.$queryRaw(client_1.Prisma.sql `
      SELECT id, reference_no, requester_id, template_id, workflow_path_id,
             classification_status, classification_confidence, classified_by,
             current_status, priority, sla_risk,
             ${SLA_DUE_AT_SUBQUERY} AS sla_due_at,
             ${OUTSTANDING_PAYMENTS_SUBQUERY} AS outstanding_payments,
             completed_at, confirmed_at,
             ${priorityRank} AS priority_rank,
             ${riskRank} AS risk_rank,
             ${dueKey} AS due_key
        FROM requests r
       WHERE current_status = ${input.status}
             ${classification}
             ${filled}
             ${extracted}
             ${keyset}
       ORDER BY priority_rank DESC, risk_rank DESC, due_key ASC, id ASC
       LIMIT ${limit + 1}
    `);
        const page = rows.slice(0, limit);
        const last = page[page.length - 1];
        return {
            items: page.map(toSummaryFromRaw),
            limit,
            nextCursor: rows.length > limit && last
                ? (0, pagination_1.encodeCursor)({
                    p: Number(last.priority_rank),
                    r: Number(last.risk_rank),
                    d: last.due_key ? last.due_key.toISOString() : INFINITY,
                    i: last.id,
                })
                : null,
        };
    }
};
exports.PrismaRequestQuery = PrismaRequestQuery;
exports.PrismaRequestQuery = PrismaRequestQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRequestQuery);
const INFINITY = 'infinity';
function dueCursor(value) {
    return value === INFINITY
        ? client_1.Prisma.sql `'infinity'::timestamptz`
        : client_1.Prisma.sql `${new Date(value)}::timestamptz`;
}
function rankCase(column, ranks) {
    const whens = Object.entries(ranks).map(([value, rank]) => client_1.Prisma.sql `WHEN ${value} THEN ${client_1.Prisma.raw(String(rank))}`);
    return client_1.Prisma.sql `(CASE ${client_1.Prisma.raw(column)} ${client_1.Prisma.join(whens, ' ')} ELSE -1 END)`;
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
    completedAt: true,
    confirmedAt: true,
};
function toSummary(row) {
    return {
        id: row.id,
        referenceNo: row.referenceNo ?? undefined,
        requesterId: row.requesterId,
        templateId: row.templateId ?? undefined,
        workflowPathId: row.workflowPathId ?? undefined,
        classificationStatus: row.classificationStatus,
        classificationConfidence: row.classificationConfidence === null
            ? undefined
            : Number(row.classificationConfidence),
        classifiedBy: row.classifiedBy ?? undefined,
        currentStatus: row.currentStatus,
        stage: (0, request_stage_1.deriveRequestStage)({
            currentStatus: row.currentStatus,
            classificationStatus: row.classificationStatus,
            confirmedAt: row.confirmedAt,
        }),
        priority: row.priority,
        slaRisk: row.slaRisk,
        slaDueAt: row.slaDueAt ? row.slaDueAt.toISOString() : undefined,
        completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
        outstandingPaymentCount: row.outstandingPaymentCount ?? 0,
    };
}
function toSummaryFromRaw(row) {
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
        slaDueAt: row.sla_due_at,
        completedAt: row.completed_at,
        confirmedAt: row.confirmed_at,
        outstandingPaymentCount: Number(row.outstanding_payments ?? 0),
    });
}
//# sourceMappingURL=prisma-request-query.js.map