import { IsIn, IsObject, IsOptional } from 'class-validator'
import type { ConfirmOutcome } from '../../../application/request/commands/confirm-request/confirm-request.command'

/**
 * The outcome is required rather than defaulted. A missing field must not be
 * read as agreement: silence is exactly what confirmation exists to rule out.
 */
export class ConfirmRequestDto {
  @IsIn(['CONFIRM', 'DISPUTE'])
  outcome!: ConfirmOutcome

  /**
   * What the requester changed or filled in. The keys are checked against the
   * template by the handler rather than here, because only the template knows
   * them.
   */
  @IsOptional()
  @IsObject()
  filledData?: Record<string, unknown>
}
