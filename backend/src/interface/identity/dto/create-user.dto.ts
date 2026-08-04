import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator'
import { UserType } from '../../../domain/identity/enums'

/**
 * Administrator-created staff/student account.
 *
 * The mirror image of RegisterUserDto: everything that carries privilege is
 * present here BECAUSE the caller is already authenticated and holds
 * user.manage. APPLICANT is excluded from the accepted types -- applicants
 * self-register, and creating one here would produce an account the domain
 * itself refuses (an applicant with an institutional number).
 */
export class CreateUserDto {
  @IsIn([UserType.EMPLOYEE, UserType.STUDENT, UserType.ADMIN])
  userType!: string

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
  institutionalNumber!: string

  /** Temporary password, handed over out of band. */
  @IsString()
  @MinLength(8)
  password!: string

  @IsOptional()
  @IsUUID()
  departmentId?: string

  @IsOptional()
  @IsString()
  preferredLang?: string

  /** Optional first role, assigned in the same transaction. */
  @IsOptional()
  @IsUUID()
  roleId?: string
}
