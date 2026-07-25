import {
  IsBooleanString,
  IsDateString,
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
}
