import { Inject, Injectable } from '@nestjs/common'
import { REPORTS_QUERY } from '../tokens'
import type {
  ClassificationCounts,
  OverviewCounts,
  PathPerformanceRow,
  ReportRange,
  ReportsQuery,
  StepBottleneckRow,
  VolumeBucket,
  VolumeGrouping,
} from './ports/reports-query.port'

export interface OverviewReport extends OverviewCounts {
  openRequests: number
  completionRate: number | null
  hitlRate: number | null
}

export interface ClassificationReport extends ClassificationCounts {
  nlpShare: number | null
  hitlRate: number | null
}

/**
 * Application service for the admin monitoring reports. It delegates the heavy
 * aggregation to the ReportsQuery port and enriches the results with derived
 * ratios (completion rate, HITL rate, NLP share) that are cheaper to compute in
 * code than to repeat in SQL. Everything here is read-only.
 */
@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_QUERY) private readonly reports: ReportsQuery,
  ) {}

  async overview(range: ReportRange): Promise<OverviewReport> {
    const c = await this.reports.overview(range)
    const classified = c.classifiedNlp + c.classifiedHitl
    return {
      ...c,
      openRequests: c.inProgress + c.onHold,
      completionRate: this.ratio(c.completed, c.totalRequests),
      hitlRate: this.ratio(c.classifiedHitl, classified),
    }
  }

  volumeByPeriod(
    range: ReportRange,
    groupBy: VolumeGrouping,
  ): Promise<VolumeBucket[]> {
    return this.reports.volumeByPeriod(range, groupBy)
  }

  pathPerformance(range: ReportRange): Promise<PathPerformanceRow[]> {
    return this.reports.pathPerformance(range)
  }

  stepBottlenecks(range: ReportRange): Promise<StepBottleneckRow[]> {
    return this.reports.stepBottlenecks(range)
  }

  async classification(range: ReportRange): Promise<ClassificationReport> {
    const c = await this.reports.classification(range)
    const classified = c.nlpCount + c.hitlCount
    return {
      ...c,
      nlpShare: this.ratio(c.nlpCount, classified),
      hitlRate: this.ratio(c.hitlCount, classified),
    }
  }

  private ratio(numerator: number, denominator: number): number | null {
    if (!denominator) return null
    return Math.round((numerator / denominator) * 10000) / 10000
  }
}
