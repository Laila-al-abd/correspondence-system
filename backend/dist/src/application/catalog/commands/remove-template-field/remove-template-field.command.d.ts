export interface RemoveTemplateFieldInput {
    templateId: string;
    fieldKey: string;
}
export declare class RemoveTemplateFieldCommand {
    readonly input: RemoveTemplateFieldInput;
    constructor(input: RemoveTemplateFieldInput);
}
