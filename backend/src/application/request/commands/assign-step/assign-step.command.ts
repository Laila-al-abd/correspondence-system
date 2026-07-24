export interface AssignStepInput {
  requestId: string
  stepInstanceId: string
  assigneeUserId: string
}

export class AssignStepCommand {
  constructor(public readonly input: AssignStepInput) {}
}
