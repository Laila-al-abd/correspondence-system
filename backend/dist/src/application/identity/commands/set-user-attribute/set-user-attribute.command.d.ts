export interface SetUserAttributeInput {
    userId: string;
    attributeCode: string;
    value: unknown;
}
export declare class SetUserAttributeCommand {
    readonly input: SetUserAttributeInput;
    constructor(input: SetUserAttributeInput);
}
