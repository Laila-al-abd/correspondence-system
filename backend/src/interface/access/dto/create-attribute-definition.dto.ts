import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator'
import { AttributeDataType } from '../../../domain/catalog/enums'

/** One allowed choice of an ENUM attribute. `value` is what gets stored. */
export class CreateAttributeOptionDto {
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

  @IsOptional()
  @IsInt()
  @Min(0)
  ordinal?: number
}

/**
 * Body for POST /access/attributes.
 *
 * The code is constrained to lower_snake_case for the same reason a template
 * field key is: it is not display text. It is the name an eligibility rule
 * carries, the key an imported user attribute is written under, and the string
 * an administrator retypes when authoring a rule.
 */
export class CreateAttributeDefinitionDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{1,49}$/, {
    message:
      'code must be 2-50 characters of lowercase letters, digits and underscores, starting with a letter',
  })
  code!: string

  @IsString()
  @Length(1, 200)
  labelAr!: string

  @IsOptional()
  @IsString()
  @Length(1, 200)
  labelEn?: string

  @IsEnum(AttributeDataType)
  dataType!: AttributeDataType

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  descriptionAr?: string

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  descriptionEn?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeOptionDto)
  options?: CreateAttributeOptionDto[]
}
