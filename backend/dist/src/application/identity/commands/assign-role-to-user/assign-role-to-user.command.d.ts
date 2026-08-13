export interface AssignRoleToUserInput {
    userId: string;
    roleId: string;
    departmentId?: string;
    reason?: string;
    expiresAt?: string;
    assignedBy?: string;
}
export declare class AssignRoleToUserCommand {
    readonly input: AssignRoleToUserInput;
    constructor(input: AssignRoleToUserInput);
}
