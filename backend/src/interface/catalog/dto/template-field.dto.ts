import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator'
import { FieldDataType } from '../../../domain/catalog/enums'

/** One choice of an ENUM field. `value` is what lands in filled_data. */
export class TemplateFieldOptionDto {
  @IsString()
  @Length(1, 100)
  value!: string

  @IsString()
  @Length(1, 200)
  labelAr!: string

  @IsOptional()
  @IsString()
  @Length(1, 200)
  labelEn?: string
}

/**
 * A field definition.
 *
 * The key is constrained to lower_snake_case because it is not display text: it
 * is a JSON key in filled_data, a grouping key in ml_predictions, and the name
 * the extractor's field loop reports. One convention, enforced at the edge,
 * keeps all three readable.
 */
export class TemplateFieldDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{1,49}$/, {
    message:
      'key must be 2-50 characters of lowercase letters, digits and underscores, starting with a letter',
  })
  key!: string

  @IsString()
  @Length(1, 200)
  labelAr!: string

  @IsOptional()
  @IsString()
  @Length(1, 200)
  labelEn?: string

  @IsEnum(FieldDataType)
  dataType!: FieldDataType

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean

  /**
   * The Arabic question the extractive QA model is asked for this field. Stored
   * verbatim: it is a model input, not a caption.
   */
  @IsOptional()
  @IsString()
  @Length(1, 500)
  extractionQuestion?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldOptionDto)
  options?: TemplateFieldOptionDto[]
}

/** PUT /templates/:id/fields -- add the field, or redefine it if it exists. */
export class UpsertTemplateFieldDto extends TemplateFieldDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  ordinal?: number
}

/** POST /templates/:id/fields/reorder */
export class ReorderTemplateFieldsDto {
  @IsArray()
  @IsString({ each: true })
  fieldKeys!: string[]
}
