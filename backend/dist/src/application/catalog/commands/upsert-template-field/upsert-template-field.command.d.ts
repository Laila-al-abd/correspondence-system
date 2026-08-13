import type { TemplateFieldInput } from '../template-field.factory';
export interface UpsertTemplateFieldInput {
    templateId: string;
    field: TemplateFieldInput;
    ordinal?: number;
}
export declare class UpsertTemplateFieldCommand {
    readonly input: UpsertTemplateFieldInput;
    constructor(input: UpsertTemplateFieldInput);
}
