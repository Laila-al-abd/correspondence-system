import { Inject, Injectable, Logger } from '@nestjs/common'
import type { AcademicCalendarRepository } from '../../../domain/observability/ports/academic-calendar.repository'
import type { SystemSettingRepository } from '../../../domain/observability/ports/system-setting.repository'
import {
  ACADEMIC_CALENDAR_REPOSITORY,
  SYSTEM_SETTING_REPOSITORY,
} from '../../tokens'

/** SystemSetting key holding the working-hours policy as JSON. */
export const WORKING_HOURS_SETTING_KEY = 'working_hours'

/**
 * When the university actually works.
 *
 * `days` uses JavaScript's numbering, 0 = Sunday ... 6 = Saturday, so the
 * default [0,1,2,3,4] is Sunday to Thursday. `start`/`end` are wall-clock times
 * in `timezone`, never in the server's clock -- a server running in UTC must
 * still enforce the university's local hours.
 */
export interface WorkingHoursPolicy {
  enabled: boolean
  days: number[]
  start: string
  end: string
  timezone: string
}

const DEFAULT_POLICY: WorkingHoursPolicy = {
  enabled: true,
  days: [0, 1, 2, 3, 4],
  start: '08:00',
  end: '15:30',
  timezone: 'Asia/Damascus',
}

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR

/** The policy is read often, so it is cached briefly rather than per request. */
const POLICY_CACHE_MS = 60 * 1000

/** Stops a malformed policy (e.g. no working days) from looping forever. */
const MAX_DAY_STEPS = 400

/** A calendar date, independent of any clock. */
interface CalendarDate {
  year: number
  month: number
  day: number
}

/** One day's working window as absolute instants. */
interface WorkingWindow {
  start: Date
  end: Date
}

/**
 * One definition of "time" for the whole system.
 *
 * Requests arrive around the clock but nobody works at 3am, so measuring
 * progress in wall-clock hours is misleading: a step opened Thursday afternoon
 * looks two days slow purely because the weekend fell in the middle. Everything
 * that cares about elapsed time -- SLA due dates, the working-hours guard, and
 * the remaining-time features fed to the LSTM -- goes through this service, so
 * they can never disagree about whether Friday counted.
 *
 * Non-working time is defined by two things: the weekly schedule in the
 * `working_hours` SystemSetting, and any AcademicCalendar period marked HOLIDAY.
 * Both are data, so the university can change its hours or add a holiday
 * without a code change or a redeploy.
 *
 * No date library is used. Timezone-correct arithmetic is done with the
 * platform's own Intl data, which handles DST shifts without a dependency.
 */
@Injectable()
export class BusinessHoursService {
  private readonly logger = new Logger(BusinessHoursService.name)
  private cached?: { policy: WorkingHoursPolicy; readAt: number }

  constructor(
    @Inject(SYSTEM_SETTING_REPOSITORY)
    private readonly settings: SystemSettingRepository,
    @Inject(ACADEMIC_CALENDAR_REPOSITORY)
    private readonly calendar: AcademicCalendarRepository,
  ) {}

  /**
   * The active policy. Falls back to the built-in default when the setting is
   * absent or unreadable, so a fresh database still behaves sensibly.
   */
  async policy(): Promise<WorkingHoursPolicy> {
    const now = Date.now()
    if (this.cached && now - this.cached.readAt < POLICY_CACHE_MS)
      return this.cached.policy

    let policy = DEFAULT_POLICY
    try {
      const setting = await this.settings.findByKey(WORKING_HOURS_SETTING_KEY)
      if (setting) policy = this.merge(setting.value)
    } catch (error) {
      this.logger.warn(
        `Could not read the working-hours policy, using defaults: ${describe(error)}`,
      )
    }

    this.cached = { policy, readAt: now }
    return policy
  }

  /** Forgets the cached policy, for use right after an admin updates it. */
  invalidate(): void {
    this.cached = undefined
  }

  /** Is this instant inside working hours on a working day? */
  async isWorkingMoment(at: Date): Promise<boolean> {
    const policy = await this.policy()
    if (!policy.enabled) return true

    const window = await this.windowFor(this.dateIn(at, policy.timezone), policy)
    if (!window) return false
    return at.getTime() >= window.start.getTime() && at.getTime() < window.end.getTime()
  }

  /**
   * The first working instant at or after `at` -- "when does the office open
   * again". Useful for telling a user when to come back.
   */
  async nextWorkingMoment(at: Date): Promise<Date> {
    const policy = await this.policy()
    if (!policy.enabled) return at

    let date = this.dateIn(at, policy.timezone)
    for (let step = 0; step < MAX_DAY_STEPS; step++) {
      const window = await this.windowFor(date, policy)
      if (window && at.getTime() < window.end.getTime())
        return at.getTime() >= window.start.getTime() ? at : window.start
      date = nextDate(date)
    }
    this.logger.warn(
      'No working day found within a year; check the working-hours policy.',
    )
    return at
  }

  /**
   * `from` plus `hours` of *working* time. This is what an SLA of "48 hours"
   * should mean: two working days, not two calendar days that may be a weekend.
   *
   * Falls back to plain wall-clock arithmetic if the policy is disabled or
   * unusable, so a step always ends up with a due date.
   */
  async addWorkingHours(from: Date, hours: number): Promise<Date> {
    const policy = await this.policy()
    if (!policy.enabled || hours <= 0)
      return new Date(from.getTime() + hours * MS_PER_HOUR)

    let remaining = hours * MS_PER_HOUR
    let cursor = from
    let date = this.dateIn(from, policy.timezone)

    for (let step = 0; step < MAX_DAY_STEPS; step++) {
      const window = await this.windowFor(date, policy)
      if (window && cursor.getTime() < window.end.getTime()) {
        const opensAt = Math.max(cursor.getTime(), window.start.getTime())
        const available = window.end.getTime() - opensAt
        if (available >= remaining) return new Date(opensAt + remaining)
        remaining -= available
      }
      date = nextDate(date)
      cursor = this.startOfDate(date, policy.timezone)
    }

    this.logger.warn(
      `Could not place a due date ${hours}h ahead within a year of working days; falling back to wall-clock time.`,
    )
    return new Date(from.getTime() + hours * MS_PER_HOUR)
  }

  /**
   * Working hours between two instants. This is the measure to train the LSTM
   * on: it removes nights, weekends, and holidays from the target, leaving only
   * time in which the request could actually have been worked on.
   */
  async workingHoursBetween(from: Date, to: Date): Promise<number> {
    if (to.getTime() <= from.getTime()) return 0

    const policy = await this.policy()
    if (!policy.enabled)
      return (to.getTime() - from.getTime()) / MS_PER_HOUR

    let total = 0
    let date = this.dateIn(from, policy.timezone)

    for (let step = 0; step < MAX_DAY_STEPS; step++) {
      const window = await this.windowFor(date, policy)
      if (window) {
        const overlapStart = Math.max(from.getTime(), window.start.getTime())
        const overlapEnd = Math.min(to.getTime(), window.end.getTime())
        if (overlapEnd > overlapStart) total += overlapEnd - overlapStart
      }
      const dayStart = this.startOfDate(date, policy.timezone).getTime()
      if (dayStart > to.getTime()) break
      date = nextDate(date)
    }

    return total / MS_PER_HOUR
  }

  // ----- internals -----

  /** The working window on a given local date, or null if it is not a workday. */
  private async windowFor(
    date: CalendarDate,
    policy: WorkingHoursPolicy,
  ): Promise<WorkingWindow | null> {
    if (!policy.days.includes(weekdayOf(date))) return null
    if (await this.isHoliday(date)) return null

    const startMinutes = minutesOfDay(policy.start, 8 * 60)
    const endMinutes = minutesOfDay(policy.end, 15 * 60 + 30)
    if (endMinutes <= startMinutes) return null

    return {
      start: this.instantAt(date, startMinutes, policy.timezone),
      end: this.instantAt(date, endMinutes, policy.timezone),
    }
  }

  /** True when any calendar period covering this date is a HOLIDAY. */
  private async isHoliday(date: CalendarDate): Promise<boolean> {
    try {
      const periods = await this.calendar.findPeriodsOn(utcMidnight(date))
      return periods.some((period) => !period.isWorkingPeriod())
    } catch (error) {
      // A calendar lookup failure must not stop work; treat the day as normal.
      this.logger.warn(`Calendar lookup failed: ${describe(error)}`)
      return false
    }
  }

  /** The local calendar date an instant falls on, in the given timezone. */
  private dateIn(at: Date, timezone: string): CalendarDate {
    const parts = localParts(at, timezone)
    return { year: parts.year, month: parts.month, day: parts.day }
  }

  /** The instant at `minutes` past local midnight on a local date. */
  private instantAt(
    date: CalendarDate,
    minutes: number,
    timezone: string,
  ): Date {
    const naive = utcMidnight(date).getTime() + minutes * MS_PER_MINUTE
    // Two passes: the first offset may be the wrong side of a DST change.
    const first = naive - offsetMs(new Date(naive), timezone)
    const second = naive - offsetMs(new Date(first), timezone)
    return new Date(second)
  }

  private startOfDate(date: CalendarDate, timezone: string): Date {
    return this.instantAt(date, 0, timezone)
  }

  /** Applies stored JSON over the defaults, ignoring anything malformed. */
  private merge(value: unknown): WorkingHoursPolicy {
    if (typeof value !== 'object' || value === null) return DEFAULT_POLICY
    const raw = value as Record<string, unknown>

    const days = Array.isArray(raw.days)
      ? raw.days.filter(
          (day): day is number =>
            typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 6,
        )
      : []

    return {
      enabled: typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_POLICY.enabled,
      days: days.length > 0 ? days : DEFAULT_POLICY.days,
      start: typeof raw.start === 'string' ? raw.start : DEFAULT_POLICY.start,
      end: typeof raw.end === 'string' ? raw.end : DEFAULT_POLICY.end,
      timezone:
        typeof raw.timezone === 'string' && raw.timezone.length > 0
          ? raw.timezone
          : DEFAULT_POLICY.timezone,
    }
  }
}

// ----- date helpers (pure functions, no clock of their own) -----

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/** Human-readable day list for error messages, e.g. "Sunday-Thursday". */
export function describeDays(days: number[]): string {
  const named = days
    .filter((day) => day >= 0 && day <= 6)
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_NAMES[day])
  if (named.length === 0) return 'no days'
  if (named.length === 1) return named[0]
  return `${named[0]}-${named[named.length - 1]}`
}

/** UTC midnight of a calendar date -- how Postgres DATE columns compare. */
function utcMidnight(date: CalendarDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day))
}

/** Day of week for a calendar date, 0 = Sunday. Pure date arithmetic. */
function weekdayOf(date: CalendarDate): number {
  return utcMidnight(date).getUTCDay()
}

function nextDate(date: CalendarDate): CalendarDate {
  const next = new Date(utcMidnight(date).getTime() + MS_PER_DAY)
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

/** Parses "HH:mm" into minutes past midnight, or returns the fallback. */
function minutesOfDay(value: string, fallback: number): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return fallback
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return fallback
  return hours * 60 + minutes
}

/** The wall-clock fields an instant shows in a given timezone. */
function localParts(
  at: Date,
  timezone: string,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const found = new Map(
    formatter.formatToParts(at).map((part) => [part.type, part.value]),
  )
  const read = (type: string): number => Number(found.get(type) ?? '0')
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  }
}

/**
 * The timezone's offset from UTC at a given instant, in milliseconds. Derived
 * by asking what wall-clock time the instant shows there and comparing, which
 * is correct across DST changes without a timezone database of our own.
 */
function offsetMs(at: Date, timezone: string): number {
  const whole = Math.floor(at.getTime() / 1000) * 1000
  const parts = localParts(new Date(whole), timezone)
  const asIfUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  return asIfUtc - whole
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
