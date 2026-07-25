import { Type } from 'class-transformer'
import {
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator'

class LocalizedTextDto {
  @IsString()
  @Length(1, 255)
  ar!: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  en?: string
}

/** Body for POST /organization/departments (manual creation). */
export class CreateDepartmentDto {
  // Org-unit type code: UNIVERSITY | FACULTY | DEPARTMENT | UNIT | OFFICE.
  @IsString()
  @Length(1, 50)
  unitTypeCode!: string

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name!: LocalizedTextDto

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto

  @IsOptional()
  @IsString()
  parentId?: string
}
