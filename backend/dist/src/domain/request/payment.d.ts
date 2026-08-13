import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { Money } from "./value-objects/money";
import { PaymentStatus } from "./enums";
interface PaymentProps {
    requestId: Identifier;
    requestStepInstanceId?: Identifier;
    money: Money;
    status: PaymentStatus;
    requestedBy?: Identifier;
    settledBy?: Identifier;
    requestedAt?: Date;
    settledAt?: Date;
    waiverReason?: string;
}
export interface PaymentSnapshot {
    requestId: string;
    requestStepInstanceId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    requestedBy?: string;
    settledBy?: string;
    requestedAt?: Date;
    settledAt?: Date;
    waiverReason?: string;
}
export declare class Payment extends AggregateRoot {
    private props;
    private constructor();
    static request(id: Identifier, p: {
        requestId: Identifier;
        money: Money;
        requestStepInstanceId?: Identifier;
        requestedBy?: Identifier;
    }): Payment;
    static rehydrate(id: Identifier, props: PaymentProps): Payment;
    private assertPending;
    confirm(by: Identifier): void;
    waive(by: Identifier, reason: string): void;
    get status(): PaymentStatus;
    get money(): Money;
    get waiverReason(): string | undefined;
    isSettled(): boolean;
    snapshot(): PaymentSnapshot;
}
export {};
