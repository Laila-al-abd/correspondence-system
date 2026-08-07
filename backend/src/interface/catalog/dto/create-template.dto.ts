import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator'
import { Priority } from '../../../domain/request/enums'
import { TemplateFieldDto } from './template-field.dto'

/** Request validation for POST /templates. */
export class CreateTemplateDto {
  /**
   * Optional, but write-once: the AI service's template_map.json and every
   * stored measurement refer to a template by this code.
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z][A-Za-z0-9_]{1,49}$/, {
    message:
      'code must be 2-50 characters of letters, digits and underscores, starting with a letter',
  })
  code?: string

  @IsUUID()
  categoryId!: string

  @IsUUID()
  sensitivityLevelId!: string

  @IsString()
  @Length(1, 255)
  titleAr!: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  titleEn?: string

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  descriptionAr?: string

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  descriptionEn?: string

  @IsOptional()
  @IsEnum(Priority)
  defaultPriority?: Priority

  /**
   * The exact Arabic text the classifier embeds. Separate from descriptionAr,
   * which is prose for people: changing this changes which requests are routed
   * to this template, and the AI service must re-embed afterwards.
   */
  @IsOptional()
  @IsString()
  @Length(1, 4000)
  classifierDocument?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldDto)
  fields?: TemplateFieldDto[]
}
