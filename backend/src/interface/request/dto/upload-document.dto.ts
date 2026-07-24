import { IsEnum, IsOptional, IsString } from 'class-validator'
import { DocKind } from '../../../domain/request/enums'

export class UploadDocumentDto {
  @IsString()
  fileName!: string

  @IsString()
  mimeType!: string

  @IsString()
  contentBase64!: string

  @IsOptional()
  @IsEnum(DocKind)
  docKind?: DocKind

  @IsOptional()
  @IsString()
  requestActionId?: string

  @IsOptional()
  @IsString()
  ocrText?: string
}
