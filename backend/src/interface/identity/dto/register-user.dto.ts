import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import {
  ApplicantPurpose,
  UserType,
} from '../../../domain/identity/enums'

export class RegisterUserDto {
  @IsEnum(UserType)
  type!: UserType

  @IsString()
  fullNameAr!: string

  @IsOptional()
  @IsString()
  fullNameEn?: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  institutionalNumber?: string

  // Required when authProvider is LOCAL (enforced in the domain).
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string

  // Kept as a string on purpose: new methods (LDAP, OTP) need no code change.
  @IsString()
  authProvider!: string

  @IsOptional()
  @IsEnum(ApplicantPurpose)
  applicantPurpose?: ApplicantPurpose

  @IsOptional()
  @IsString()
  departmentId?: string

  @IsOptional()
  @IsString()
  preferredLang?: string
}
