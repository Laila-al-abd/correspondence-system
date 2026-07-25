import { Controller, Get, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ReportsService } from '../../application/reporting/reports.service'
import type { ReportRange } from '../../application/reporting/ports/reports-query.port'
import { RequirePermissions } from '../identity/permissions.decorator'
import { ReportQueryDto } from './dto/report-query.dto'
import { VolumeQueryDto } from './dto/volume-query.dto'
import { toCsv } from './csv.util'

/**
 * Admin monitoring reports. Every route is read-only and gated behind the
 * reports.view permission. Each report returns JSON by default and a CSV
 * download when called with ?format=csv, over an optional from/to time window.
 */
@Controller('reports')
@RequirePermissions('reports.view')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('overview')
  async overview(
    @Query() query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const data = await this.reports.overview(this.range(query))
    return this.respond(res, query.format, 'overview', data, [data])
  }

  @Get('volume')
  async volume(
    @Query() query: VolumeQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const data = await this.reports.volumeByPeriod(
      this.range(query),
      query.groupBy ?? 'day',
    )
    return this.respond(res, query.format, 'request-volume', data, data)
  }

  @Get('paths')
  async paths(
    @Query() query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const data = await this.reports.pathPerformance(this.range(query))
    return this.respond(res, query.format, 'path-performance', data, data)
  }

  @Get('steps')
  async steps(
    @Query() query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const data = await this.reports.stepBottlenecks(this.range(query))
    return this.respond(res, query.format, 'step-bottlenecks', data, data)
  }

  @Get('classification')
  async classification(
    @Query() query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const data = await this.reports.classification(this.range(query))
    return this.respond(res, query.format, 'classification', data, [data])
  }

  private range(query: ReportQueryDto): ReportRange {
    return {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    }
  }

  private respond(
    res: Response,
    format: string | undefined,
    filename: string,
    json: unknown,
    csvRows: object[],
  ): unknown {
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}.csv"`,
      )
      return toCsv(csvRows)
    }
    return json
  }
}
