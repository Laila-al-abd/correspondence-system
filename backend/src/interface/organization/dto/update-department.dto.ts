import { Type } from 'class-transformer'
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator'

class LocalizedTextDto {
  @IsString()
  @Length(1, 255)
  ar!: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  en?: string
}

/**
 * Body for PATCH /organization/departments/:id.
 *
 * Both fields are optional so a caller can rename without restating the
 * description, but sending neither is refused by the handler rather than
 * silently succeeding. Sending description: null clears it; omitting it leaves
 * it untouched. unitTypeCode and parentId are absent on purpose -- see the
 * handler.
 */
export class UpdateDepartmentDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name?: LocalizedTextDto

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto | null
}
