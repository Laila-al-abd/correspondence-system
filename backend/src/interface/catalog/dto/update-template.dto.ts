import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator'
import { Priority } from '../../../domain/request/enums'

/**
 * Request validation for PATCH /templates/:id. Only the properties present are
 * applied. Fields are authored through the field routes, so a text correction
 * cannot silently rewrite the form.
 */
export class UpdateTemplateDto {
  /** Only accepted while the template has no code assigned. */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z][A-Za-z0-9_]{1,49}$/, {
    message:
      'code must be 2-50 characters of letters, digits and underscores, starting with a letter',
  })
  code?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @IsUUID()
  sensitivityLevelId?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  titleAr?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  titleEn?: string

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  descriptionAr?: string

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  descriptionEn?: string

  @IsOptional()
  @IsEnum(Priority)
  defaultPriority?: Priority

  @IsOptional()
  @IsString()
  @Length(0, 4000)
  classifierDocument?: string

  /** false retires the template; true brings a retired one back. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
