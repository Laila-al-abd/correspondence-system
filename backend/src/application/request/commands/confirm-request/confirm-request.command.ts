/** What the requester decided about the proposal in front of them. */
export type ConfirmOutcome = 'CONFIRM' | 'DISPUTE'

export interface ConfirmRequestInput {
  requestId: string
  /** The signed-in user, taken from the token and never from the body. */
  actorId: string
  outcome: ConfirmOutcome
  /**
   * Corrections the requester made to the form before accepting it, including
   * the required fields the extractor honestly left blank. Merged rather than
   * replacing, so the values they did not touch keep what the model found.
   * Ignored on DISPUTE, where the whole form is dropped anyway.
   */
  filledData?: Record<string, unknown>
}

export class ConfirmRequestCommand {
  constructor(readonly input: ConfirmRequestInput) {}
}
