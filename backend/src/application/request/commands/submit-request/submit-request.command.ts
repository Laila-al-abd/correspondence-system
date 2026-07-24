export interface SubmitRequestInput {
  requesterId: string
  rawText?: string
  filledData?: Record<string, unknown>
  priority?: string
}

export class SubmitRequestCommand {
  constructor(public readonly input: SubmitRequestInput) {}
}
