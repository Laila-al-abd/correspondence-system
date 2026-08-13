import { ValueObject } from "../../shared/value-object";
export declare class Money extends ValueObject<{
    amount: number;
    currency: string;
}> {
    private constructor();
    static create(amount: number, currency?: string): Money;
    get amount(): number;
    get currency(): string;
}
