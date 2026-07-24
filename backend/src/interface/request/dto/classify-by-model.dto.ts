import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Priority } from '../../../domain/request/enums'

export class ClassifyByModelDto {
  @IsString()
  templateId!: string

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number

  @IsOptional()
  @IsEnum(Priority)
  suggestedPriority?: Priority
}
