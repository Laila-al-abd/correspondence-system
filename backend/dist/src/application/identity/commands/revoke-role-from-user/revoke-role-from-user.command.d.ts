export interface RevokeRoleFromUserInput {
    userId: string;
    roleId: string;
    departmentId?: string;
}
export declare class RevokeRoleFromUserCommand {
    readonly input: RevokeRoleFromUserInput;
    constructor(input: RevokeRoleFromUserInput);
}
