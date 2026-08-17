export interface CreateAttributeOptionInput {
    value: string;
    labelAr: string;
    labelEn?: string;
    ordinal?: number;
}
export interface CreateAttributeDefinitionInput {
    code: string;
    labelAr: string;
    labelEn?: string;
    dataType: string;
    descriptionAr?: string;
    descriptionEn?: string;
    options?: CreateAttributeOptionInput[];
}
export declare class CreateAttributeDefinitionCommand {
    readonly input: CreateAttributeDefinitionInput;
    constructor(input: CreateAttributeDefinitionInput);
}
