import { Identifier } from "../../shared/identifier"
import { AcademicCalendar } from "../academic-calendar"

export interface AcademicCalendarRepository {
  findById(id: Identifier): Promise<AcademicCalendar | null>
  findPeriodsOn(day: Date): Promise<AcademicCalendar[]>
}
