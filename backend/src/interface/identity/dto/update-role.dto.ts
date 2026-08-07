import { Type } from 'class-transformer'
import { IsOptional, ValidateNested } from 'class-validator'
import { LocalizedTextDto } from './create-role.dto'

/**
 * Body for PATCH /roles/:roleId. The name is required even when only the
 * description is changing -- a role cannot be nameless -- and an omitted
 * description clears the stored one.
 */
export class UpdateRoleDto {
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name!: LocalizedTextDto

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto
}
