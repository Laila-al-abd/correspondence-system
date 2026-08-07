import { Type } from 'class-transformer'
import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator'

export class LocalizedTextDto {
  @IsString()
  @Length(1, 255)
  ar!: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  en?: string
}

/** Body for POST /roles. */
export class CreateRoleDto {
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name!: LocalizedTextDto

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto

  // Permission codes, e.g. ["request.read", "request.act"]. Optional: a role can
  // be created empty and filled in from the permissions screen.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionCodes?: string[]
}
