import { Injectable } from '@nestjs/common'
import { Request } from '../../domain/request/request'
import { RequestRepository } from '../../domain/request/ports/request.repository'
import { RequestStatus } from '../../domain/request/enums'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { RequestMapper, requestInclude } from './request.mapper'

/**
 * Prisma-backed RequestRepository. A request is an aggregate made of a root row
 * plus its runtime step instances. Reads eager-load the step instances; save()
 * upserts the root and each step instance by id inside one transaction. Step
 * instances are upserted (never bulk-deleted) so that action/payment rows that
 * reference them keep their foreign keys.
 */
@Injectable()
export class PrismaRequestRepository implements RequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Request | null> {
    const row = await this.prisma.request.findFirst({
      where: { id: BigInt(id.toString()) },
      include: requestInclude,
    })
    return row ? RequestMapper.toDomain(row) : null
  }

  async findByReferenceNo(referenceNo: string): Promise<Request | null> {
    const row = await this.prisma.request.findFirst({
      where: { referenceNo },
      include: requestInclude,
    })
    return row ? RequestMapper.toDomain(row) : null
  }

  async listByRequester(requesterId: Identifier): Promise<Request[]> {
    const rows = await this.prisma.request.findMany({
      where: { requesterId: BigInt(requesterId.toString()) },
      include: requestInclude,
      orderBy: { id: 'desc' },
    })
    return rows.map((row) => RequestMapper.toDomain(row))
  }

  async listAssignedTo(userId: Identifier): Promise<Request[]> {
    const rows = await this.prisma.request.findMany({
      where: {
        stepInstances: {
          some: { assignedToUserId: BigInt(userId.toString()) },
        },
      },
      include: requestInclude,
      orderBy: { id: 'desc' },
    })
    return rows.map((row) => RequestMapper.toDomain(row))
  }

  async listByStatus(status: RequestStatus): Promise<Request[]> {
    const rows = await this.prisma.request.findMany({
      where: { currentStatus: status },
      include: requestInclude,
      orderBy: { id: 'desc' },
    })
    return rows.map((row) => RequestMapper.toDomain(row))
  }

  async save(request: Request): Promise<void> {
    const id = BigInt(request.id.toString())
    const root = RequestMapper.toRoot(request)
    const stepInstances = request.snapshot().stepInstances

    await this.prisma.$transaction(async (tx) => {
      await tx.request.upsert({ where: { id }, create: root, update: root })
      for (const si of stepInstances) {
        const data = RequestMapper.toStepInstanceRow(si)
        await tx.requestStepInstance.upsert({
          where: { id: BigInt(si.id) },
          create: data,
          update: data,
        })
      }
    })
  }
}
