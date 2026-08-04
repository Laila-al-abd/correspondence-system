import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'
import { ExtractionFieldMeta } from '../../../application/request/commands/record-extraction/record-extraction.command'

/**
 * Body of PATCH /requests/:id/filled-data.
 *
 * `filledData` is partial by design -- the extractor sends what it found, not
 * a whole form -- and the field keys are validated against the template by the
 * handler rather than here, because only the template knows them.
 */
export class RecordExtractionDto {
  @IsObject()
  filledData!: Record<string, unknown>

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  abstained?: string[]

  @IsOptional()
  @IsObject()
  extractionMeta?: Record<string, ExtractionFieldMeta>

  // Bounded by the model_version column, which is VARCHAR(50).
  @IsString()
  @Length(1, 50)
  modelVersion!: string

  @IsOptional()
  @IsNumber()
  nullThreshold?: number
}
