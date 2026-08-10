import { IsObject, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator'

/**
 * What a requester may say when submitting: the text they wrote, and (for
 * clients that already know the form) its values. Deliberately no priority --
 * urgency is declared per template by an administrator, so nobody can send
 * their own request to the front of a shared queue by ticking a box.
 */
export class SubmitRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  rawText!: string

  @IsOptional()
  @IsObject()
  filledData?: Record<string, unknown>
}
