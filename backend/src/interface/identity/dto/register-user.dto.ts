import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { ApplicantPurpose } from '../../../domain/identity/enums'

/**
 * Public self-registration, for external applicants only.
 *
 * Anything that decides *what the account is allowed to do* is intentionally
 * absent: user type, institutional number, department and auth provider are
 * fixed by the server. With the global ValidationPipe running in whitelist
 * mode, a caller who sends them anyway has them stripped before the handler
 * sees the body, so they cannot self-promote to STUDENT, EMPLOYEE or ADMIN.
 *
 * Staff and student accounts are created by an administrator or synced from
 * the university directory, never through this endpoint.
 */
export class RegisterUserDto {
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

  @IsString()
  @MinLength(8)
  password!: string

  @IsOptional()
  @IsEnum(ApplicantPurpose)
  applicantPurpose?: ApplicantPurpose

  @IsOptional()
  @IsString()
  preferredLang?: string
}
