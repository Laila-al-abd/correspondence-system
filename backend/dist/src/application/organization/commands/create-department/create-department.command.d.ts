export interface CreateDepartmentInput {
    unitTypeCode: string;
    name: {
        ar: string;
        en?: string;
    };
    description?: {
        ar: string;
        en?: string;
    };
    parentId?: string;
}
export declare class CreateDepartmentCommand {
    readonly input: CreateDepartmentInput;
    constructor(input: CreateDepartmentInput);
}
