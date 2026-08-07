/**
 * Raise or lower the business priority of a single request.
 *
 * The escape hatch that makes a per-template default workable. Most urgency is
 * a property of the request type and is declared once, but some of it genuinely
 * is not: a medical case, an external deadline, a scholarship cut-off. Those are
 * judgements about one person's circumstances that no template and no model can
 * make, so a member of staff makes them -- and says why.
 *
 * The reason is required. A request that moved up a shared queue with nothing
 * recorded beside it is indistinguishable from favouritism, and this is exactly
 * the row an auditor reads.
 */
export interface ChangeRequestPriorityInput {
  requestId: string
  /** From the token, never the body. */
  actorId: string
  priority: string
  reason: string
}

export class ChangeRequestPriorityCommand {
  constructor(public readonly input: ChangeRequestPriorityInput) {}
}
