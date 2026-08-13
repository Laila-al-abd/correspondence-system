import { AcademicCalendar } from '../../domain/observability/academic-calendar';
import { AcademicCalendarRepository } from '../../domain/observability/ports/academic-calendar.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaAcademicCalendarRepository implements AcademicCalendarRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<AcademicCalendar | null>;
    findPeriodsOn(day: Date): Promise<AcademicCalendar[]>;
}
