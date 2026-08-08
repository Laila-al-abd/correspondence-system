/**
 * Frontend TypeScript types for the Reporting module.
 * Synchronized with backend DTOs, query ports, and service responses.
 * Generated from:
 * - backend/src/interface/reporting/dto/*.dto.ts
 * - backend/src/application/reporting/ports/reports-query.port.ts
 * - backend/src/application/reporting/reports.service.ts
 * - backend/src/interface/reporting/reports.controller.ts
 */

// ============================================================================
// Raw Aggregate Shapes (matching backend query port return types)
// ============================================================================

/**
 * Time range for report queries.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (ReportRange)
 * NOTE: Internal type used by service, not returned to client.
 */
export interface ReportRange {
  from?: string; // ISO 8601 date string
  to?: string;   // ISO 8601 date string
}

/**
 * Volume grouping options.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (VolumeGrouping)
 * NOTE: Internal type used by service, not returned to client.
 */
export type VolumeGrouping = 'day' | 'week' | 'month';

/**
 * Raw overview aggregate counts.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (OverviewCounts)
 */
export interface OverviewCounts {
  totalRequests: number;
  draft: number;
  inProgress: number;
  onHold: number;
  completed: number;
  rejected: number;
  cancelled: number;
  slaOnTrack: number;
  slaAtRisk: number;
  slaBreached: number;
  openStepInstances: number;
  avgTurnaroundHours: number | null;
  classifiedNlp: number;
  classifiedHitl: number;
  classificationPending: number;
  avgConfidence: number | null;
}

/**
 * Volume time series bucket.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (VolumeBucket)
 */
export interface VolumeBucket {
  period: string;
  count: number;
}

/**
 * Path performance row.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (PathPerformanceRow)
 */
export interface PathPerformanceRow {
  pathId: string;
  pathName: string | null;
  templateId: string;
  requestCount: number;
  completedCount: number;
  avgTurnaroundHours: number | null;
  breachedSteps: number;
  avgDelayHours: number | null;
}

/**
 * Step bottleneck row.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (StepBottleneckRow)
 */
export interface StepBottleneckRow {
  stepId: string;
  stepName: string | null;
  pathId: string;
  pathName: string | null;
  instanceCount: number;
  openCount: number;
  avgWaitHours: number | null;
  avgProcessingHours: number | null;
  breachedCount: number;
}

/**
 * Classification aggregate counts.
 * Source: backend/src/application/reporting/ports/reports-query.port.ts (ClassificationCounts)
 */
export interface ClassificationCounts {
  total: number;
  pending: number;
  nlpCount: number;
  hitlCount: number;
  avgConfidence: number | null;
  avgConfidenceNlp: number | null;
  avgConfidenceHitl: number | null;
}

// ============================================================================
// Service Response Types (enriched with derived ratios)
// ============================================================================

/**
 * Overview report with derived ratios.
 * Matches: ReportsService.overview() returns OverviewReport
 * Source: backend/src/application/reporting/reports.service.ts (OverviewReport)
 */
export interface OverviewReport extends OverviewCounts {
  /** inProgress + onHold */
  openRequests: number;
  /** completed / totalRequests */
  completionRate: number | null;
  /** classifiedHitl / (classifiedNlp + classifiedHitl) */
  hitlRate: number | null;
}

/**
 * Classification report with derived ratios.
 * Matches: ReportsService.classification() returns ClassificationReport
 * Source: backend/src/application/reporting/reports.service.ts (ClassificationReport)
 */
export interface ClassificationReport extends ClassificationCounts {
  /** nlpCount / (nlpCount + hitlCount) */
  nlpShare: number | null;
  /** hitlCount / (nlpCount + hitlCount) */
  hitlRate: number | null;
}