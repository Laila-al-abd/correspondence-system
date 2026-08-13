export interface ClearUserAttributeInput {
    userId: string;
    attributeCode: string;
}
export declare class ClearUserAttributeCommand {
    readonly input: ClearUserAttributeInput;
    constructor(input: ClearUserAttributeInput);
}
