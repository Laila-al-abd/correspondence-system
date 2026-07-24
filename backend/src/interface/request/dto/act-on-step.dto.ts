import { IsEnum, IsOptional, IsString } from 'class-validator'
import { StepActionKind } from '../../../application/request/commands/act-on-step/act-on-step.command'

export class ActOnStepDto {
  @IsEnum(StepActionKind)
  action!: StepActionKind

  @IsOptional()
  @IsString()
  actionTypeId?: string

  @IsOptional()
  @IsString()
  comment?: string
}
