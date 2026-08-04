import {
  IsBooleanString,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator'

/** Query params for GET /delegations. */
export class ListDelegationsDto {
  @IsOptional()
  @IsString()
  delegatorId?: string

  @IsOptional()
  @IsString()
  delegateId?: string

  @IsOptional()
  @IsBooleanString()
  activeOnly?: string

  @IsOptional()
  @IsDateString()
  onDate?: string

  // Page size (1..200, default 50).
  @IsOptional()
  @IsNumberString()
  limit?: string

  // Zero-based offset.
  @IsOptional()
  @IsNumberString()
  offset?: string
}
