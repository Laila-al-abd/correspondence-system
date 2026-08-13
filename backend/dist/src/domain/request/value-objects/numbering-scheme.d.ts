import { ValueObject } from "../../shared/value-object";
export type SequenceResetPolicy = "YEARLY" | "MONTHLY" | "NEVER";
export interface NumberingSchemeConfig {
    pattern?: string;
    prefix?: string;
    seqPadding?: number;
    resetPolicy?: SequenceResetPolicy;
    yearDigits?: number;
}
type NumberingSchemeProps = {
    pattern: string;
    prefix: string;
    seqPadding: number;
    resetPolicy: SequenceResetPolicy;
    yearDigits: number;
};
export declare class NumberingScheme extends ValueObject<NumberingSchemeProps> {
    private constructor();
    static create(config?: NumberingSchemeConfig): NumberingScheme;
    scopeFor(date: Date): string;
    format(sequence: number, date: Date): string;
    private pad;
    get pattern(): string;
    get resetPolicy(): SequenceResetPolicy;
}
export {};
