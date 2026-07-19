import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { CalendarPeriodType } from "./enums"

interface CalendarProps {
  name: LocalizedText
  periodType: CalendarPeriodType
  startDate: Date
  endDate: Date
  description?: LocalizedText
}

/**
 * A named academic period (exam, registration, holiday, regular). Feeds the
 * LSTM feature pipeline and SLA logic — e.g. holidays can pause timers and
 * exam periods are a strong signal for processing delays.
 */
export class AcademicCalendar extends Entity {
  private constructor(id: Identifier, private props: CalendarProps) {
    super(id)
  }

  static create(id: Identifier, p: CalendarProps): AcademicCalendar {
    if (p.endDate < p.startDate)
      throw new InvariantViolationError("Calendar end date is before its start date.")
    return new AcademicCalendar(id, p)
  }

  static rehydrate(id: Identifier, props: CalendarProps): AcademicCalendar {
    return new AcademicCalendar(id, props)
  }

  /** Does this period contain the given day (inclusive)? */
  covers(day: Date): boolean { return day >= this.props.startDate && day <= this.props.endDate }

  /** Holidays are treated as non-working for SLA calculations. */
  isWorkingPeriod(): boolean { return this.props.periodType !== CalendarPeriodType.HOLIDAY }

  get periodType(): CalendarPeriodType { return this.props.periodType }
}
