export interface UpdateDepartmentInput {
    id: string;
    name?: {
        ar: string;
        en?: string;
    };
    description?: {
        ar: string;
        en?: string;
    } | null;
}
export declare class UpdateDepartmentCommand {
    readonly input: UpdateDepartmentInput;
    constructor(input: UpdateDepartmentInput);
}
