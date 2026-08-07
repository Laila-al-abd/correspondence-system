/** The two ways a fee can end. Both are one-way and both are recorded. */
export enum PaymentSettlement {
  CONFIRM = 'CONFIRM',
  WAIVE = 'WAIVE',
}

/**
 * Ends the life of a fee.
 *
 * CONFIRM means the money arrived; WAIVE means the institute decided to forgo
 * it and the request proceeds anyway -- an exemption, a hardship case, an
 * internal request, or a fee charged in error. A waiver carries a reason
 * because it is the one outcome nobody can reconstruct later from the amount
 * and the dates, and it is the first thing an audit asks to see justified.
 *
 * The requestId is not redundant with the paymentId: it is what stops a caller
 * settling a fee on some other request by guessing an id, since the route that
 * reaches this handler is scoped to a request.
 */
export interface SettlePaymentInput {
  requestId: string
  paymentId: string
  /** From the token, never the body. */
  actorId: string
  settlement: PaymentSettlement
  reason?: string
}

export class SettlePaymentCommand {
  constructor(public readonly input: SettlePaymentInput) {}
}
