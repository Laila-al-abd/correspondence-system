import { IsOptional, IsString, Length } from 'class-validator'

/** Optional override of the source-system label recorded on synced units. */
export class SyncDepartmentsDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  source?: string
}
