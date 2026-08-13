export interface GrantDelegationInput {
    delegatorId: string;
    delegateId: string;
    startDate: string;
    endDate: string;
    reason?: string;
}
export declare class GrantDelegationCommand {
    readonly input: GrantDelegationInput;
    constructor(input: GrantDelegationInput);
}
