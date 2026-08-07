import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'
import { StepActionKind } from '../../../application/request/commands/act-on-step/act-on-step.command'

export class ActOnStepDto {
  @IsEnum(StepActionKind)
  action!: StepActionKind

  @IsString()
  @ValidateIf((obj) => obj.action === StepActionKind.REJECT || obj.action === StepActionKind.SKIP)
  @IsNotEmpty({ message: 'You must provide a reason (actionTypeId) when rejecting or skipping a step.' })
  actionTypeId?: string

  @IsOptional()
  @IsString()
  comment?: string
}
