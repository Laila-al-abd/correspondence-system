import {
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

/**
 * Query parameters for GET /requests/assigned.
 *
 * `ready` arrives as the string "true" or "false", because query strings have
 * no booleans. An unrecognised value is a 400 rather than a filter that quietly
 * means "false": hiding work from the person who owns it is the one failure mode
 * this list must not have.
 */
export class ListAssignedDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  ready?: string

  @IsOptional()
  @IsNumberString()
  limit?: string

  @IsOptional()
  @IsString()
  @Length(1, 512)
  cursor?: string
}
