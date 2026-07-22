import { Prisma, Payment as PaymentRow } from '../../../generated/prisma/client'
import { Payment } from '../../domain/request/payment'
import { Money } from '../../domain/request/value-objects/money'
import { PaymentStatus } from '../../domain/request/enums'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the Payment aggregate and the `payments` row. */
export const PaymentMapper = {
  toDomain(row: PaymentRow): Payment {
    return Payment.rehydrate(Identifier.of(row.id), {
      requestId: Identifier.of(row.requestId),
      requestStepInstanceId:
        row.requestStepInstanceId != null
          ? Identifier.of(row.requestStepInstanceId)
          : undefined,
      money: Money.create(row.amount.toNumber(), row.currency),
      status: row.status as PaymentStatus,
      requestedBy: row.requestedBy != null ? Identifier.of(row.requestedBy) : undefined,
      confirmedBy: row.confirmedBy != null ? Identifier.of(row.confirmedBy) : undefined,
      requestedAt: row.requestedAt ?? undefined,
      confirmedAt: row.confirmedAt ?? undefined,
    })
  },

  toPersistence(payment: Payment): Prisma.PaymentUncheckedCreateInput {
    const s = payment.snapshot()
    return {
      id: BigInt(payment.id.toString()),
      requestId: BigInt(s.requestId),
      requestStepInstanceId: s.requestStepInstanceId
        ? BigInt(s.requestStepInstanceId)
        : null,
      amount: s.amount,
      currency: s.currency,
      status: s.status,
      requestedBy: s.requestedBy ? BigInt(s.requestedBy) : null,
      confirmedBy: s.confirmedBy ? BigInt(s.confirmedBy) : null,
      requestedAt: s.requestedAt ?? null,
      confirmedAt: s.confirmedAt ?? null,
    }
  },
}
