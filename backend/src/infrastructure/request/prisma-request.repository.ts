import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import { Request } from '../../domain/request/request'
import { RequestRepository } from '../../domain/request/ports/request.repository'
import { RequestStatus } from '../../domain/request/enums'
import { Identifier } from '../../domain/shared/identifier'
import { ConcurrentModificationError } from '../../application/errors'
import { PrismaService } from '../persistence/prisma.service'
import { PrismaTransactionRunner } from '../persistence/prisma-transaction-runner'
import { dbClient } from '../persistence/transaction-context'
import { RequestMapper, requestInclude } from './request.mapper'

/**
 * Prisma-backed RequestRepository. A request is an aggregate made of a root row
 * plus its runtime step instances. Reads eager-load the step instances; save()
 * writes the root and each step instance inside one transaction. Step instances
 * are upserted (never bulk-deleted) so that action/payment rows that reference
 * them keep their foreign keys.
 */
@Injectable()
export class PrismaRequestRepository implements RequestRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: PrismaTransactionRunner,
  ) {}

  /**
   * Reads and writes go through the open transaction when the caller started a
   * unit of work, and through the plain client otherwise.
   */
  private get db() {
    return dbClient(this.prisma)
  }

  async findById(id: Identifier): Promise<Request | null> {
    const row = await this.db.request.findFirst({
      where: { id: id.toString() },
      include: requestInclude,
    })
    return row ? RequestMapper.toDomain(row) : null
  }

  async findByReferenceNo(referenceNo: string): Promise<Request | null> {
    const row = await this.db.request.findFirst({
      where: { referenceNo },
      include: requestInclude,
    })
    return row ? RequestMapper.toDomain(row) : null
  }

  async listByRequester(requesterId: Identifier): Promise<Request[]> {
    const rows = await this.db.request.findMany({
      where: { requesterId: requesterId.toString() },
      include: requestInclude,
      orderBy: { id: 'desc' },
    })
    return rows.map((row) => RequestMapper.toDomain(row))
  }

  async listAssignedTo(userId: Identifier): Promise<Request[]> {
    const rows = await this.db.request.findMany({
      where: {
        stepInstances: {
          some: { assignedToUserId: userId.toString() },
        },
      },
      include: requestInclude,
      orderBy: { id: 'desc' },
    })
    return rows.map((row) => RequestMapper.toDomain(row))
  }

  async listByStatus(status: RequestStatus): Promise<Request[]> {
    const rows = await this.db.request.findMany({
      where: { currentStatus: status },
      include: requestInclude,
      orderBy: { id: 'desc' },
    })
    return rows.map((row) => RequestMapper.toDomain(row))
  }

  /**
   * Optimistic locking.
   *
   * The update only matches a row whose version is still the one we loaded, and
   * bumps it in the same statement. If two people act on the same request at
   * the same moment, both read version 4, both compute a new state from it, and
   * the second write matches nothing -- so instead of silently erasing the
   * first decision, it fails and the caller is told to reload. Doing the check
   * and the bump in one statement is what makes it safe: there is no gap
   * between them for the other writer to slip through.
   *
   * A miss can mean two different things, so we look: if the row exists, this
   * really is a conflict; if it does not, this is a brand new request being
   * saved for the first time.
   */
  async save(request: Request): Promise<void> {
    const id = request.id.toString()
    const root = RequestMapper.toRoot(request)
    const stepInstances = request.snapshot().stepInstances
    const expectedVersion = request.version

    const update = {
      ...root,
      version: { increment: 1 },
    } as Prisma.RequestUncheckedUpdateManyInput

    await this.transactions.run(async () => {
      const db = this.db

      const written = await db.request.updateMany({
        where: { id, version: expectedVersion },
        data: update,
      })

      if (written.count === 0) {
        const existing = await db.request.findUnique({
          where: { id },
          select: { id: true },
        })
        if (existing) throw new ConcurrentModificationError('request', id)
        await db.request.create({ data: root })
      }

      for (const si of stepInstances) {
        const data = RequestMapper.toStepInstanceRow(si)
        await db.requestStepInstance.upsert({
          where: { id: si.id },
          create: data,
          update: data,
        })
      }
    })
  }
}
