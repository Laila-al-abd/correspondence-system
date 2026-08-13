import { Prisma, Payment as PaymentRow } from '../../../generated/prisma/client';
import { Payment } from '../../domain/request/payment';
export declare const PaymentMapper: {
    toDomain(row: PaymentRow): Payment;
    toPersistence(payment: Payment): Prisma.PaymentUncheckedCreateInput;
};
