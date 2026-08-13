export declare enum PaymentSettlement {
    CONFIRM = "CONFIRM",
    WAIVE = "WAIVE"
}
export interface SettlePaymentInput {
    requestId: string;
    paymentId: string;
    actorId: string;
    settlement: PaymentSettlement;
    reason?: string;
}
export declare class SettlePaymentCommand {
    readonly input: SettlePaymentInput;
    constructor(input: SettlePaymentInput);
}
