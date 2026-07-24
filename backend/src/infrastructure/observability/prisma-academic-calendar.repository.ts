import { Injectable } from '@nestjs/common'
import { AcademicCalendar } from '../../domain/observability/academic-calendar'
import { AcademicCalendarRepository } from '../../domain/observability/ports/academic-calendar.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { AcademicCalendarMapper } from './academic-calendar.mapper'

/**
 * Prisma-backed AcademicCalendarRepository over the `academic_calendar` table.
 * `findPeriodsOn` returns every period whose date range contains a given day --
 * used by SLA logic and the LSTM feature pipeline (e.g. exam / holiday flags).
 */
@Injectable()
export class PrismaAcademicCalendarRepository
  implements AcademicCalendarRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<AcademicCalendar | null> {
    const row = await this.prisma.academicCalendar.findFirst({
      where: { id: BigInt(id.toString()) },
    })
    return row ? AcademicCalendarMapper.toDomain(row) : null
  }

  async findPeriodsOn(day: Date): Promise<AcademicCalendar[]> {
    const rows = await this.prisma.academicCalendar.findMany({
      where: { startDate: { lte: day }, endDate: { gte: day } },
      orderBy: { startDate: 'asc' },
    })
    return rows.map((row) => AcademicCalendarMapper.toDomain(row))
  }
}
