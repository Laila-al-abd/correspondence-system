import { Payment } from '../../domain/request/payment';
import { PaymentRepository } from '../../domain/request/ports/payment.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaPaymentRepository implements PaymentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    findById(id: Identifier): Promise<Payment | null>;
    listByRequest(requestId: Identifier): Promise<Payment[]>;
    save(payment: Payment): Promise<void>;
}
