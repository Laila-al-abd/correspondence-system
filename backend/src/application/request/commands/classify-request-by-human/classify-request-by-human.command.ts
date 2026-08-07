export interface ClassifyRequestByHumanInput {
  requestId: string
  templateId: string
  /**
   * The form, filled by the same reviewer in the same visit.
   *
   * Optional only so a reviewer may classify first and fill afterwards through
   * PATCH /requests/:id/filled-data, but sending it here is the intended path.
   * Text ambiguous enough to defeat the classifier is text the extractor is
   * likely to fail on as well, so handing the request back to a machine after a
   * person has already read it buys a wrong form, a dispute, and a second trip
   * through this same queue. One human visit, one call.
   *
   * A replacement, not a merge: what a reviewer types is an answer, not a patch
   * over somebody else's partial guesses.
   */
  filledData?: Record<string, unknown>
}

export class ClassifyRequestByHumanCommand {
  constructor(public readonly input: ClassifyRequestByHumanInput) {}
}
