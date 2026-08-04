import { Injectable } from '@nestjs/common'
import { AcademicCalendar } from '../../domain/observability/academic-calendar'
import { AcademicCalendarRepository } from '../../domain/observability/ports/academic-calendar.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { AcademicCalendarMapper } from './academic-calendar.mapper'

/**
 * Prisma-backed AcademicCalendarRepository over the `academic_calendar` table.
 * `findPeriodsOn` returns every period whose date range contains a given day --
 * used by the working-hours calculation to exclude holidays from every deadline
 * and every measured duration.
 */
@Injectable()
export class PrismaAcademicCalendarRepository
  implements AcademicCalendarRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<AcademicCalendar | null> {
    const row = await this.prisma.academicCalendar.findFirst({
      where: { id: id.toString() },
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
