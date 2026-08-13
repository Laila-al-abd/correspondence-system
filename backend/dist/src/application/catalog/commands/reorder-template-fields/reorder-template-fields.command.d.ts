export interface ReorderTemplateFieldsInput {
    templateId: string;
    fieldKeys: string[];
}
export declare class ReorderTemplateFieldsCommand {
    readonly input: ReorderTemplateFieldsInput;
    constructor(input: ReorderTemplateFieldsInput);
}
