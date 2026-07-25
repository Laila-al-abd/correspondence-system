import {
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

/** Query params for GET /users. */
export class ListUsersDto {
  // Case-insensitive match on name, email, or institutional number.
  @IsOptional()
  @IsString()
  @Length(1, 255)
  search?: string

  @IsOptional()
  @IsString()
  @Length(1, 30)
  userType?: string

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: string

  @IsOptional()
  @IsString()
  departmentId?: string

  // Page size (1..200, default 50).
  @IsOptional()
  @IsNumberString()
  limit?: string

  // Zero-based offset.
  @IsOptional()
  @IsNumberString()
  offset?: string
}
