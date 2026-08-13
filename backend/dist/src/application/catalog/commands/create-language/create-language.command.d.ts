export interface CreateLanguageInput {
    code: string;
    name: string;
    nativeName: string;
    isEnabled?: boolean;
    isDefault?: boolean;
}
export declare class CreateLanguageCommand {
    readonly input: CreateLanguageInput;
    constructor(input: CreateLanguageInput);
}
