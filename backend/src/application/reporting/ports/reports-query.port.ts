export interface ReportRange {
  from?: Date
  to?: Date
}

export type VolumeGrouping = 'day' | 'week' | 'month'

// Raw aggregate shapes returned by the read adapter. Counts are integers and
// hour/confidence figures are already rounded; the application service layers
// derived ratios on top of these.
export interface OverviewCounts {
  totalRequests: number
  draft: number
  inProgress: number
  onHold: number
  completed: number
  rejected: number
  cancelled: number
  slaOnTrack: number
  slaAtRisk: number
  slaBreached: number
  openStepInstances: number
  avgTurnaroundHours: number | null
  classifiedNlp: number
  classifiedHitl: number
  classificationPending: number
  avgConfidence: number | null
}

export interface VolumeBucket {
  period: string
  count: number
}

export interface PathPerformanceRow {
  pathId: string
  pathName: string | null
  templateId: string
  requestCount: number
  completedCount: number
  avgTurnaroundHours: number | null
  breachedSteps: number
  avgDelayHours: number | null
}

export interface StepBottleneckRow {
  stepId: string
  stepName: string | null
  pathId: string
  pathName: string | null
  instanceCount: number
  openCount: number
  avgWaitHours: number | null
  avgProcessingHours: number | null
  breachedCount: number
}

export interface ClassificationCounts {
  total: number
  pending: number
  nlpCount: number
  hitlCount: number
  avgConfidence: number | null
  avgConfidenceNlp: number | null
}

/**
 * Read-only reporting port. All queries are pure aggregations over the
 * operational tables; nothing here mutates state.
 */
export interface ReportsQuery {
  overview(range: ReportRange): Promise<OverviewCounts>
  volumeByPeriod(
    range: ReportRange,
    groupBy: VolumeGrouping,
  ): Promise<VolumeBucket[]>
  pathPerformance(range: ReportRange): Promise<PathPerformanceRow[]>
  stepBottlenecks(range: ReportRange): Promise<StepBottleneckRow[]>
  classification(range: ReportRange): Promise<ClassificationCounts>
}
