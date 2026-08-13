import type { LocalizedTextInput } from '../create-role/create-role.command';
export interface UpdateRoleInput {
    roleId: string;
    name: LocalizedTextInput;
    description?: LocalizedTextInput;
}
export declare class UpdateRoleCommand {
    readonly input: UpdateRoleInput;
    constructor(input: UpdateRoleInput);
}
