import { IsIn, IsOptional } from 'class-validator'
import { ReportQueryDto } from './report-query.dto'

/** Query parameters for the request-volume report. */
export class VolumeQueryDto extends ReportQueryDto {
  // Bucket size for the time series; defaults to day.
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month'
}
