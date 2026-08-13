export interface LocalizedTextInput {
    ar: string;
    en?: string;
}
export interface CreateRoleInput {
    name: LocalizedTextInput;
    description?: LocalizedTextInput;
    permissionCodes?: string[];
    createdBy?: string;
}
export declare class CreateRoleCommand {
    readonly input: CreateRoleInput;
    constructor(input: CreateRoleInput);
}
