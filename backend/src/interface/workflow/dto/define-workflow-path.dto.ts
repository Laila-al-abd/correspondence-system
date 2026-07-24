import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator'
import { AssigneeType } from '../../../domain/workflow/enums'

class LocalizedTextDto {
  @IsString()
  @Length(1, 255)
  ar!: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  en?: string
}

class WorkflowStepDto {
  @IsString()
  @Length(1, 100)
  key!: string

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name!: LocalizedTextDto

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto

  @IsEnum(AssigneeType)
  assigneeType!: AssigneeType

  @IsOptional()
  @IsString()
  assigneeRoleId?: string

  @IsOptional()
  @IsString()
  assigneeDepartmentId?: string

  @IsOptional()
  @IsString()
  defaultActionTypeId?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  slaHours?: number

  @IsOptional()
  @IsBoolean()
  pausesSla?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedActionTypeIds?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependsOn?: string[]
}

/**
 * Validation for POST /workflow-paths. Steps reference one another by `key`; the
 * handler resolves those keys to generated ids and validates the resulting graph
 * (acyclic, has an entry step) before persisting.
 */
export class DefineWorkflowPathDto {
  @IsString()
  templateId!: string

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name!: LocalizedTextDto

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps!: WorkflowStepDto[]

  @IsOptional()
  @IsBoolean()
  activate?: boolean
}
