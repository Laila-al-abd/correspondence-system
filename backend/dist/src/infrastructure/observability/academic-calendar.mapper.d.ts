import { Prisma, AcademicCalendar as AcademicCalendarRow } from '../../../generated/prisma/client';
import { AcademicCalendar } from '../../domain/observability/academic-calendar';
export declare const AcademicCalendarMapper: {
    toDomain(row: AcademicCalendarRow): AcademicCalendar;
    toPersistence(calendar: AcademicCalendar): Prisma.AcademicCalendarUncheckedCreateInput;
};
