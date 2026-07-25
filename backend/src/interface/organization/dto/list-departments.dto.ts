import { IsBooleanString, IsOptional, IsString, Length } from 'class-validator'

/** Query params for GET /organization/departments. */
export class ListDepartmentsDto {
  // Substring match against the Arabic or English department name.
  @IsOptional()
  @IsString()
  @Length(1, 255)
  search?: string

  // Restrict the result to the direct children of this department id.
  @IsOptional()
  @IsString()
  parentId?: string

  // 'true' to return only active units; omit for all.
  @IsOptional()
  @IsBooleanString()
  activeOnly?: string
}
