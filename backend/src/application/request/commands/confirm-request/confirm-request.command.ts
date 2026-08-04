/** What the requester decided about the proposal in front of them. */
export type ConfirmOutcome = 'CONFIRM' | 'DISPUTE'

export interface ConfirmRequestInput {
  requestId: string
  /** The signed-in user, taken from the token and never from the body. */
  actorId: string
  outcome: ConfirmOutcome
}

export class ConfirmRequestCommand {
  constructor(readonly input: ConfirmRequestInput) {}
}
