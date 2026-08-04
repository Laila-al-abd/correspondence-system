import { IsIn } from 'class-validator'
import type { ConfirmOutcome } from '../../../application/request/commands/confirm-request/confirm-request.command'

/**
 * The outcome is required rather than defaulted. A missing field must not be
 * read as agreement: silence is exactly what confirmation exists to rule out.
 */
export class ConfirmRequestDto {
  @IsIn(['CONFIRM', 'DISPUTE'])
  outcome!: ConfirmOutcome
}
