import type { ClassificationCounts, OverviewCounts, PathPerformanceRow, ReportRange, ReportsQuery, StepBottleneckRow, VolumeBucket, VolumeGrouping } from './ports/reports-query.port';
export interface OverviewReport extends OverviewCounts {
    openRequests: number;
    completionRate: number | null;
    hitlRate: number | null;
}
export interface ClassificationReport extends ClassificationCounts {
    nlpShare: number | null;
    hitlRate: number | null;
}
export declare class ReportsService {
    private readonly reports;
    constructor(reports: ReportsQuery);
    overview(range: ReportRange): Promise<OverviewReport>;
    volumeByPeriod(range: ReportRange, groupBy: VolumeGrouping): Promise<VolumeBucket[]>;
    pathPerformance(range: ReportRange): Promise<PathPerformanceRow[]>;
    stepBottlenecks(range: ReportRange): Promise<StepBottleneckRow[]>;
    classification(range: ReportRange): Promise<ClassificationReport>;
    private ratio;
}
