import { Injectable } from '@nestjs/common'
import type {
  OpenStepSla,
  SlaScanPort,
} from '../../application/observability/ports/sla-scan.port'
import { PrismaService } from '../persistence/prisma.service'

// A step still consumes its SLA until it reaches a terminal state. These are
// the same statuses the routing engine treats as "open workload".
const OPEN_STATUSES = ['PENDING', 'IN_PROGRESS', 'WAITING']

/**
 * Prisma adapter for SlaScanPort.
 *
 * Deliberately a flat projection: only the three columns the monitor needs,
 * ordered by the tightest deadline so that a capped sweep always deals with
 * the most urgent work first rather than an arbitrary slice.
 *
 * Paused steps are excluded. A step whose clock is paused (waiting on the
 * applicant, for example) must not accumulate breach time -- that delay is not
 * the office's fault, and counting it would make the SLA figures punish staff
 * for other people's silence.
 */
@Injectable()
export class PrismaSlaScan implements SlaScanPort {
  constructor(private readonly prisma: PrismaService) {}

  async findOpenStepsWithDeadline(limit: number): Promise<OpenStepSla[]> {
    const rows = await this.prisma.requestStepInstance.findMany({
      where: {
        status: { in: OPEN_STATUSES },
        slaPaused: false,
        slaDueAt: { not: null },
      },
      select: { id: true, requestId: true, slaDueAt: true },
      orderBy: { slaDueAt: 'asc' },
      take: limit,
    })

    const open: OpenStepSla[] = []
    for (const row of rows) {
      if (row.slaDueAt === null) continue
      open.push({
        requestId: row.requestId.toString(),
        stepInstanceId: row.id.toString(),
        slaDueAt: row.slaDueAt,
      })
    }
    return open
  }
}
