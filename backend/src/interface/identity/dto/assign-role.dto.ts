import { IsISO8601, IsOptional, IsString, Length } from 'class-validator'

/** Body for POST /users/:userId/roles. */
export class AssignRoleDto {
  @IsString()
  roleId!: string

  // Optional department scope; omit for a global (workspace-wide) role.
  @IsOptional()
  @IsString()
  departmentId?: string

  // Optional expiry; omit for a permanent assignment.
  @IsOptional()
  @IsISO8601()
  expiresAt?: string

  // Optional note recorded on the assignment: why this person holds this role.
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string
}
