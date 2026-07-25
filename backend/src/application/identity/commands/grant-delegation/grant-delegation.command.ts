export interface GrantDelegationInput {
  delegatorId: string
  delegateId: string
  startDate: string
  endDate: string
  reason?: string
}

export class GrantDelegationCommand {
  constructor(public readonly input: GrantDelegationInput) {}
}
