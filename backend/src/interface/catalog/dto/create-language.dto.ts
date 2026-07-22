import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

/**
 * Request validation for POST /languages. This is the interface-layer
 * equivalent of DLMS's FluentValidation validators.
 */
export class CreateLanguageDto {
  @IsString()
  @Length(2, 10)
  code!: string

  @IsString()
  @Length(1, 100)
  name!: string

  @IsString()
  @Length(1, 100)
  nativeName!: string

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
