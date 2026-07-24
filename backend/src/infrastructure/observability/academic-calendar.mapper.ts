import {
  Prisma,
  AcademicCalendar as AcademicCalendarRow,
} from '../../../generated/prisma/client'
import { AcademicCalendar } from '../../domain/observability/academic-calendar'
import { CalendarPeriodType } from '../../domain/observability/enums'
import { LocalizedText } from '../../domain/shared/localized-text'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the AcademicCalendar entity and the `academic_calendar` row. */
export const AcademicCalendarMapper = {
  toDomain(row: AcademicCalendarRow): AcademicCalendar {
    const name = row.name as unknown as { ar: string; en?: string }
    const description = row.description as unknown as {
      ar: string
      en?: string
    } | null
    return AcademicCalendar.rehydrate(Identifier.of(row.id), {
      name: LocalizedText.create(name.ar, name.en),
      periodType: row.periodType as CalendarPeriodType,
      startDate: row.startDate,
      endDate: row.endDate,
      description: description
        ? LocalizedText.create(description.ar, description.en)
        : undefined,
    })
  },

  toPersistence(
    calendar: AcademicCalendar,
  ): Prisma.AcademicCalendarUncheckedCreateInput {
    const s = calendar.snapshot()
    return {
      id: BigInt(calendar.id.toString()),
      name: s.name as Prisma.InputJsonValue,
      periodType: s.periodType,
      startDate: s.startDate,
      endDate: s.endDate,
      description: s.description
        ? (s.description as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    }
  },
}
