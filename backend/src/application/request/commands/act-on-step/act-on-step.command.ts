export enum StepActionKind {
  START = 'START',
  COMPLETE = 'COMPLETE',
  REJECT = 'REJECT',
  SKIP = 'SKIP',
}

export interface ActOnStepInput {
  requestId: string
  stepInstanceId: string
  actorId: string
  action: StepActionKind
  actionTypeId?: string
  comment?: string
}

export class ActOnStepCommand {
  constructor(public readonly input: ActOnStepInput) {}
}
