import { IsIn, IsISO8601, IsOptional } from 'class-validator'

/** Shared query parameters for the reporting endpoints. */
export class ReportQueryDto {
  // Inclusive lower bound on request creation time (ISO 8601). Omit for all time.
  @IsOptional()
  @IsISO8601()
  from?: string

  // Inclusive upper bound on request creation time (ISO 8601). Omit for all time.
  @IsOptional()
  @IsISO8601()
  to?: string

  // Response format; defaults to JSON. Use csv to download a spreadsheet.
  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv'
}
