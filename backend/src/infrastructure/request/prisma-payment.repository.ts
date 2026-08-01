import { Injectable } from '@nestjs/common'
import { Payment } from '../../domain/request/payment'
import { PaymentRepository } from '../../domain/request/ports/payment.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { dbClient } from '../persistence/transaction-context'
import { PaymentMapper } from './payment.mapper'

/** Prisma-backed PaymentRepository over the `payments` table. */
@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reads and writes go through the open transaction when the caller started a
   * unit of work, and through the plain client otherwise.
   */
  private get db() {
    return dbClient(this.prisma)
  }

  async findById(id: Identifier): Promise<Payment | null> {
    const row = await this.db.payment.findFirst({
      where: { id: id.toString() },
    })
    return row ? PaymentMapper.toDomain(row) : null
  }

  async listByRequest(requestId: Identifier): Promise<Payment[]> {
    const rows = await this.db.payment.findMany({
      where: { requestId: requestId.toString() },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => PaymentMapper.toDomain(row))
  }

  async save(payment: Payment): Promise<void> {
    const data = PaymentMapper.toPersistence(payment)
    await this.db.payment.upsert({
      where: { id: payment.id.toString() },
      create: data,
      update: data,
    })
  }
}
