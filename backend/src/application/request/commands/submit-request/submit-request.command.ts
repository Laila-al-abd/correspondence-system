/**
 * Note what is absent: a priority. A submitter naming their own urgency is a
 * submitter jumping the shared queue, and the field was accepted here while no
 * screen ever offered it -- an open door nobody was using. Priority now comes
 * from the template a request is classified onto, and only staff holding
 * `request.act` can change it afterwards, with a reason.
 */
export interface SubmitRequestInput {
  requesterId: string
  rawText?: string
  filledData?: Record<string, unknown>
}

export class SubmitRequestCommand {
  constructor(public readonly input: SubmitRequestInput) {}
}
