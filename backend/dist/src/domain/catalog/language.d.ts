export interface LanguageProps {
    code: string;
    name: string;
    nativeName: string;
    isEnabled: boolean;
    isDefault: boolean;
}
export declare class Language {
    private readonly props;
    private constructor();
    static create(input: {
        code: string;
        name: string;
        nativeName: string;
        isEnabled?: boolean;
        isDefault?: boolean;
    }): Language;
    static rehydrate(props: LanguageProps): Language;
    get code(): string;
    get name(): string;
    get nativeName(): string;
    get isEnabled(): boolean;
    get isDefault(): boolean;
    toJSON(): LanguageProps;
}
