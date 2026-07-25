import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

/** Body for POST /delegations. */
export class GrantDelegationDto {
  @IsString()
  delegatorId!: string

  @IsString()
  delegateId!: string

  // Inclusive calendar dates (YYYY-MM-DD or full ISO).
  @IsDateString()
  startDate!: string

  @IsDateString()
  endDate!: string

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string
}
