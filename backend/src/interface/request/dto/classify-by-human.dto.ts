import { IsEnum, IsOptional, IsString } from 'class-validator'
import { Priority } from '../../../domain/request/enums'

export class ClassifyByHumanDto {
  @IsString()
  templateId!: string

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority
}
