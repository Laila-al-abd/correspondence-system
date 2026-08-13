import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { TemplateField } from "./template-field";
import { TemplateEligibilityRule } from "./template-eligibility-rule";
import { Priority } from "../request/enums";
export interface FilledDataViolation {
    fieldKey: string;
    reason: string;
}
interface TemplateProps {
    code?: string;
    categoryId?: Identifier;
    title: LocalizedText;
    description?: LocalizedText;
    sensitivityLevelId?: Identifier;
    defaultPriority: Priority;
    isActive: boolean;
    classifierDocument?: string;
    fields: TemplateField[];
    eligibilityRules: TemplateEligibilityRule[];
}
export declare class Template extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        categoryId?: Identifier;
        title: LocalizedText;
        sensitivityLevelId?: Identifier;
        description?: LocalizedText;
        code?: string;
        classifierDocument?: string;
        defaultPriority?: Priority;
    }): Template;
    static rehydrate(id: Identifier, props: TemplateProps): Template;
    addField(field: TemplateField): void;
    field(fieldKey: string): TemplateField | undefined;
    nextOrdinal(): number;
    removeField(fieldKey: string): void;
    reorderFields(fieldKeys: string[]): void;
    setText(title: LocalizedText, description?: LocalizedText): void;
    setCategory(categoryId: Identifier): void;
    setSensitivityLevel(sensitivityLevelId: Identifier): void;
    addEligibilityRule(rule: TemplateEligibilityRule): void;
    removeEligibilityRule(ruleId: Identifier): void;
    assignCode(code: string): void;
    setClassifierDocument(document?: string): void;
    private static normaliseCode;
    get code(): string | undefined;
    get classifierDocument(): string | undefined;
    activate(): void;
    deactivate(): void;
    get isActive(): boolean;
    get categoryId(): Identifier | undefined;
    get sensitivityLevelId(): Identifier | undefined;
    get defaultPriority(): Priority;
    setDefaultPriority(priority: Priority): void;
    get fields(): readonly TemplateField[];
    unknownKeys(keys: Iterable<string>): string[];
    validateFilledData(filledData: Record<string, unknown>): FilledDataViolation[];
    validatePartial(partial: Record<string, unknown>): FilledDataViolation[];
    validateSubmission(filledData: Record<string, unknown>): string[];
    isEligible(userAttributes: Map<string, unknown>): boolean;
    unmetEligibilityRules(userAttributes: Map<string, unknown>): ReturnType<TemplateEligibilityRule["snapshot"]>[];
    snapshot(): {
        code?: string;
        classifierDocument?: string;
        categoryId?: string;
        title: {
            ar: string;
            en?: string;
        };
        description?: {
            ar: string;
            en?: string;
        };
        sensitivityLevelId?: string;
        defaultPriority: Priority;
        isActive: boolean;
        fields: ReturnType<TemplateField["snapshot"]>[];
        eligibilityRules: ReturnType<TemplateEligibilityRule["snapshot"]>[];
    };
}
export {};
