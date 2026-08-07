import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

/**
 * Body of POST /requests/:id/classify/model, sent by the AI service. It reports
 * a template and a confidence and nothing else; a `suggestedPriority` field
 * used to be accepted here and is now ignored, because urgency belongs to the
 * template rather than to a reading of the requester's wording.
 */
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
  @IsString()
  modelVersion?: string
}
