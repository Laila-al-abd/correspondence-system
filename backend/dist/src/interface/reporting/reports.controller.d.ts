import type { Response } from 'express';
import { ReportsService } from '../../application/reporting/reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { VolumeQueryDto } from './dto/volume-query.dto';
export declare class ReportsController {
    private readonly reports;
    constructor(reports: ReportsService);
    overview(query: ReportQueryDto, res: Response): Promise<unknown>;
    volume(query: VolumeQueryDto, res: Response): Promise<unknown>;
    paths(query: ReportQueryDto, res: Response): Promise<unknown>;
    steps(query: ReportQueryDto, res: Response): Promise<unknown>;
    classification(query: ReportQueryDto, res: Response): Promise<unknown>;
    private range;
    private respond;
}
