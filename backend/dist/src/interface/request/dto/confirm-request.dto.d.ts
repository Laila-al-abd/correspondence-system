import type { ConfirmOutcome } from '../../../application/request/commands/confirm-request/confirm-request.command';
export declare class ConfirmRequestDto {
    outcome: ConfirmOutcome;
    filledData?: Record<string, unknown>;
}
