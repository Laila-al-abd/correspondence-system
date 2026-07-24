import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator'
import { Priority } from '../../../domain/request/enums'

export class SubmitRequestDto {
  @IsOptional()
  @IsString()
  rawText?: string

  @IsOptional()
  @IsObject()
  filledData?: Record<string, unknown>

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority
}
