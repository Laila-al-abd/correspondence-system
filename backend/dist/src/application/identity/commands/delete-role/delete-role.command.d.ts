export interface DeleteRoleInput {
    roleId: string;
}
export declare class DeleteRoleCommand {
    readonly input: DeleteRoleInput;
    constructor(input: DeleteRoleInput);
}
