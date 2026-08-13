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
exports.PrismaReportsQuery = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../generated/prisma/client");
const prisma_service_1 = require("../persistence/prisma.service");
const GROUPING_UNIT = {
    day: 'day',
    week: 'week',
    month: 'month',
};
let PrismaReportsQuery = class PrismaReportsQuery {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview(range) {
        const where = this.whereRange('created_at', range);
        const [row] = await this.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE current_status = 'DRAFT')::int AS draft,
        count(*) FILTER (WHERE current_status = 'IN_PROGRESS')::int AS in_progress,
        count(*) FILTER (WHERE current_status = 'ON_HOLD')::int AS on_hold,
        count(*) FILTER (WHERE current_status = 'COMPLETED')::int AS completed,
        count(*) FILTER (WHERE current_status = 'REJECTED')::int AS rejected,
        count(*) FILTER (WHERE current_status = 'CANCELLED')::int AS cancelled,
        count(*) FILTER (WHERE sla_risk = 'ON_TRACK')::int AS sla_on_track,
        count(*) FILTER (WHERE sla_risk = 'AT_RISK')::int AS sla_at_risk,
        count(*) FILTER (WHERE sla_risk = 'BREACHED')::int AS sla_breached,
        count(*) FILTER (WHERE classified_by = 'NLP')::int AS classified_nlp,
        count(*) FILTER (WHERE classified_by = 'HITL')::int AS classified_hitl,
        count(*) FILTER (WHERE classification_status = 'PENDING')::int AS classification_pending,
        avg(classification_confidence)::float8 AS avg_confidence,
        avg(extract(epoch FROM (completed_at - created_at)) / 3600.0)
          FILTER (WHERE completed_at IS NOT NULL)::float8 AS avg_turnaround_hours
      FROM requests
      ${where}
    `);
        const [openRow] = await this.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT count(*)::int AS open_steps
      FROM request_step_instances si
      JOIN requests r ON r.id = si.request_id
      WHERE si.status IN ('PENDING', 'IN_PROGRESS', 'WAITING')
      ${this.andRange('r.created_at', range)}
    `);
        return {
            totalRequests: this.int(row.total),
            draft: this.int(row.draft),
            inProgress: this.int(row.in_progress),
            onHold: this.int(row.on_hold),
            completed: this.int(row.completed),
            rejected: this.int(row.rejected),
            cancelled: this.int(row.cancelled),
            slaOnTrack: this.int(row.sla_on_track),
            slaAtRisk: this.int(row.sla_at_risk),
            slaBreached: this.int(row.sla_breached),
            openStepInstances: this.int(openRow.open_steps),
            avgTurnaroundHours: this.round(this.num(row.avg_turnaround_hours), 2),
            classifiedNlp: this.int(row.classified_nlp),
            classifiedHitl: this.int(row.classified_hitl),
            classificationPending: this.int(row.classification_pending),
            avgConfidence: this.round(this.num(row.avg_confidence), 4),
        };
    }
    async volumeByPeriod(range, groupBy) {
        const unit = GROUPING_UNIT[groupBy];
        if (!unit)
            throw new Error(`Unsupported grouping: ${groupBy}`);
        const rows = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT
          to_char(date_trunc(${client_1.Prisma.raw(`'${unit}'`)}, created_at), 'YYYY-MM-DD') AS period,
          count(*)::int AS count
        FROM requests
        ${this.whereRange('created_at', range)}
        GROUP BY 1
        ORDER BY 1
      `);
        return rows.map((r) => ({
            period: String(r.period),
            count: this.int(r.count),
        }));
    }
    async pathPerformance(range) {
        const volume = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT
          wp.id::text AS path_id,
          coalesce(wp.name->>'en', wp.name->>'ar') AS path_name,
          wp.template_id::text AS template_id,
          count(r.id)::int AS request_count,
          count(r.id) FILTER (WHERE r.current_status = 'COMPLETED')::int AS completed_count,
          avg(extract(epoch FROM (r.completed_at - r.created_at)) / 3600.0)
            FILTER (WHERE r.completed_at IS NOT NULL)::float8 AS avg_turnaround_hours
        FROM workflow_paths wp
        LEFT JOIN requests r
          ON r.workflow_path_id = wp.id${this.andRange('r.created_at', range)}
        GROUP BY wp.id, wp.name, wp.template_id
      `);
        const sla = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT
          wp.id::text AS path_id,
          count(*) FILTER (
            WHERE si.completed_at IS NOT NULL AND si.sla_due_at IS NOT NULL
              AND si.completed_at > si.sla_due_at
          )::int AS breached_steps,
          avg(extract(epoch FROM (si.completed_at - si.sla_due_at)) / 3600.0)
            FILTER (
              WHERE si.completed_at IS NOT NULL AND si.sla_due_at IS NOT NULL
                AND si.completed_at > si.sla_due_at
            )::float8 AS avg_delay_hours
        FROM workflow_paths wp
        LEFT JOIN workflow_steps ws ON ws.workflow_path_id = wp.id
        LEFT JOIN request_step_instances si
          ON si.workflow_step_id = ws.id${this.andRange('si.created_at', range)}
        GROUP BY wp.id
      `);
        const slaById = new Map(sla.map((s) => [String(s.path_id), s]));
        const result = volume.map((v) => {
            const s = slaById.get(String(v.path_id));
            return {
                pathId: String(v.path_id),
                pathName: v.path_name === null ? null : String(v.path_name),
                templateId: String(v.template_id),
                requestCount: this.int(v.request_count),
                completedCount: this.int(v.completed_count),
                avgTurnaroundHours: this.round(this.num(v.avg_turnaround_hours), 2),
                breachedSteps: s ? this.int(s.breached_steps) : 0,
                avgDelayHours: s ? this.round(this.num(s.avg_delay_hours), 2) : null,
            };
        });
        result.sort((a, b) => {
            const ad = a.avgDelayHours ?? -1;
            const bd = b.avgDelayHours ?? -1;
            if (bd !== ad)
                return bd - ad;
            return b.breachedSteps - a.breachedSteps;
        });
        return result;
    }
    async stepBottlenecks(range) {
        const rows = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT
          ws.id::text AS step_id,
          coalesce(ws.name->>'en', ws.name->>'ar') AS step_name,
          wp.id::text AS path_id,
          coalesce(wp.name->>'en', wp.name->>'ar') AS path_name,
          count(si.id)::int AS instance_count,
          count(si.id) FILTER (
            WHERE si.status IN ('PENDING', 'IN_PROGRESS', 'WAITING')
          )::int AS open_count,
          avg(extract(epoch FROM (si.started_at - si.created_at)) / 3600.0)
            FILTER (WHERE si.started_at IS NOT NULL)::float8 AS avg_wait_hours,
          avg(extract(epoch FROM (si.completed_at - si.started_at)) / 3600.0)
            FILTER (WHERE si.completed_at IS NOT NULL AND si.started_at IS NOT NULL)::float8 AS avg_processing_hours,
          count(si.id) FILTER (
            WHERE si.completed_at IS NOT NULL AND si.sla_due_at IS NOT NULL
              AND si.completed_at > si.sla_due_at
          )::int AS breached_count
        FROM workflow_steps ws
        JOIN workflow_paths wp ON wp.id = ws.workflow_path_id
        LEFT JOIN request_step_instances si
          ON si.workflow_step_id = ws.id${this.andRange('si.created_at', range)}
        GROUP BY ws.id, ws.name, wp.id, wp.name
        ORDER BY avg_processing_hours DESC NULLS LAST
      `);
        return rows.map((r) => ({
            stepId: String(r.step_id),
            stepName: r.step_name === null ? null : String(r.step_name),
            pathId: String(r.path_id),
            pathName: r.path_name === null ? null : String(r.path_name),
            instanceCount: this.int(r.instance_count),
            openCount: this.int(r.open_count),
            avgWaitHours: this.round(this.num(r.avg_wait_hours), 2),
            avgProcessingHours: this.round(this.num(r.avg_processing_hours), 2),
            breachedCount: this.int(r.breached_count),
        }));
    }
    async classification(range) {
        const [row] = await this.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE classification_status = 'PENDING')::int AS pending,
        count(*) FILTER (WHERE classified_by = 'NLP')::int AS nlp_count,
        count(*) FILTER (WHERE classified_by = 'HITL')::int AS hitl_count,
        avg(classification_confidence)::float8 AS avg_confidence,
        avg(classification_confidence) FILTER (WHERE classified_by = 'NLP')::float8 AS avg_confidence_nlp
      FROM requests
      ${this.whereRange('created_at', range)}
    `);
        return {
            total: this.int(row.total),
            pending: this.int(row.pending),
            nlpCount: this.int(row.nlp_count),
            hitlCount: this.int(row.hitl_count),
            avgConfidence: this.round(this.num(row.avg_confidence), 4),
            avgConfidenceNlp: this.round(this.num(row.avg_confidence_nlp), 4),
        };
    }
    whereRange(column, range) {
        const conds = this.rangeConds(column, range);
        return conds.length
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(conds, ' AND ')}`
            : client_1.Prisma.empty;
    }
    andRange(column, range) {
        const conds = this.rangeConds(column, range);
        return conds.length
            ? client_1.Prisma.sql ` AND ${client_1.Prisma.join(conds, ' AND ')}`
            : client_1.Prisma.empty;
    }
    rangeConds(column, range) {
        const conds = [];
        if (range.from)
            conds.push(client_1.Prisma.sql `${client_1.Prisma.raw(column)} >= ${range.from}`);
        if (range.to)
            conds.push(client_1.Prisma.sql `${client_1.Prisma.raw(column)} <= ${range.to}`);
        return conds;
    }
    int(value) {
        const n = Number(value);
        return Number.isFinite(n) ? Math.trunc(n) : 0;
    }
    num(value) {
        if (value === null || value === undefined)
            return null;
        const n = Number(value);
        return Number.isNaN(n) ? null : n;
    }
    round(value, dp) {
        if (value === null)
            return null;
        const f = Math.pow(10, dp);
        return Math.round(value * f) / f;
    }
};
exports.PrismaReportsQuery = PrismaReportsQuery;
exports.PrismaReportsQuery = PrismaReportsQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaReportsQuery);
//# sourceMappingURL=prisma-reports-query.js.map