export interface RevokePermissionFromRoleInput {
    roleId: string;
    permissionCode: string;
}
export declare class RevokePermissionFromRoleCommand {
    readonly input: RevokePermissionFromRoleInput;
    constructor(input: RevokePermissionFromRoleInput);
}
