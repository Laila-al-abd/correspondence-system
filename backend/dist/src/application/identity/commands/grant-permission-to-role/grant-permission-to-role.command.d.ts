export interface GrantPermissionToRoleInput {
    roleId: string;
    permissionCode: string;
}
export declare class GrantPermissionToRoleCommand {
    readonly input: GrantPermissionToRoleInput;
    constructor(input: GrantPermissionToRoleInput);
}
