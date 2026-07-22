import { Injectable } from '@nestjs/common'
import { Payment } from '../../domain/request/payment'
import { PaymentRepository } from '../../domain/request/ports/payment.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { PaymentMapper } from './payment.mapper'

/** Prisma-backed PaymentRepository over the `payments` table. */
@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Payment | null> {
    const row = await this.prisma.payment.findFirst({
      where: { id: BigInt(id.toString()) },
    })
    return row ? PaymentMapper.toDomain(row) : null
  }

  async listByRequest(requestId: Identifier): Promise<Payment[]> {
    const rows = await this.prisma.payment.findMany({
      where: { requestId: BigInt(requestId.toString()) },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => PaymentMapper.toDomain(row))
  }

  async save(payment: Payment): Promise<void> {
    const data = PaymentMapper.toPersistence(payment)
    await this.prisma.payment.upsert({
      where: { id: BigInt(payment.id.toString()) },
      create: data,
      update: data,
    })
  }
}
