import { PrismaService } from '../persistence/prisma.service';
import type { ClassificationCounts, OverviewCounts, PathPerformanceRow, ReportRange, ReportsQuery, StepBottleneckRow, VolumeBucket, VolumeGrouping } from '../../application/reporting/ports/reports-query.port';
export declare class PrismaReportsQuery implements ReportsQuery {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(range: ReportRange): Promise<OverviewCounts>;
    volumeByPeriod(range: ReportRange, groupBy: VolumeGrouping): Promise<VolumeBucket[]>;
    pathPerformance(range: ReportRange): Promise<PathPerformanceRow[]>;
    stepBottlenecks(range: ReportRange): Promise<StepBottleneckRow[]>;
    classification(range: ReportRange): Promise<ClassificationCounts>;
    private whereRange;
    private andRange;
    private rangeConds;
    private int;
    private num;
    private round;
}
