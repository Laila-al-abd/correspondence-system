import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

/**
 * Body for the manual retention sweep. Omitting the field falls back to the
 * configured default (30 days), which is what the nightly job uses.
 */
export class PurgeNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  retentionDays?: number
}
