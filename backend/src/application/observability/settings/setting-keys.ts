import { InvariantViolationError } from '../../../domain/shared/domain-error'
import {
  NumberingScheme,
  NumberingSchemeConfig,
} from '../../../domain/request/value-objects/numbering-scheme'
import { EntityNotFoundError } from '../../errors'
import {
  DEFAULT_POLICY,
  WORKING_HOURS_SETTING_KEY,
} from '../services/business-hours.service'

/** SystemSetting key holding the reference-numbering scheme as JSON. */
export const REQUEST_NUMBERING_SETTING_KEY = 'request_numbering'

/**
 * Mirrors the defaults inside NumberingScheme so a caller that has never
 * written the setting still sees the values actually in force. The scheme
 * remains the single authority: every write is validated by it below.
 */
const DEFAULT_NUMBERING: NumberingSchemeConfig = {
  pattern: '{prefix}-{year}-{seq}',
  prefix: 'REQ',
  seqPadding: 5,
  resetPolicy: 'YEARLY',
  yearDigits: 4,
}

/**
 * One administrable system setting: what it is for, what it looks like when
 * nobody has configured it, how to tell a valid value from a broken one, and
 * whether writing it must clear a cache somewhere.
 */
export interface SettingDefinition {
  key: string
  description: string
  defaultValue: unknown
  validate(value: unknown): void
  /** True when a write must clear BusinessHoursService's cached policy. */
  invalidatesWorkingHours: boolean
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

function asRecord(value: unknown, key: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new InvariantViolationError(
      `The "${key}" setting must be a JSON object.`,
    )
  return value as Record<string, unknown>
}

function minutesOf(time: string, field: string): number {
  const match = TIME_PATTERN.exec(time)
  if (!match)
    throw new InvariantViolationError(
      `"${field}" must be a 24-hour time such as "08:00".`,
    )
  return Number(match[1]) * 60 + Number(match[2])
}

/**
 * Guards the working-hours policy.
 *
 * This exists because BusinessHoursService is deliberately forgiving at read
 * time: it ignores malformed JSON and falls back to defaults so a bad row can
 * never stop the university working. That tolerance would otherwise let a
 * typo be saved and silently ignored, with the administrator believing the
 * hours had changed. Validation therefore belongs on the write path, where it
 * can still be reported to a human.
 */
function validateWorkingHours(value: unknown): void {
  const raw = asRecord(value, WORKING_HOURS_SETTING_KEY)

  if ('enabled' in raw && typeof raw.enabled !== 'boolean')
    throw new InvariantViolationError('"enabled" must be true or false.')

  if ('days' in raw) {
    const days = raw.days
    if (!Array.isArray(days) || days.length === 0)
      throw new InvariantViolationError(
        '"days" must be a non-empty array of weekday numbers, where 0 is Sunday.',
      )
    for (const day of days) {
      if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 6)
        throw new InvariantViolationError(
          '"days" may only contain whole numbers from 0 (Sunday) to 6 (Saturday).',
        )
    }
    if (new Set(days as number[]).size !== days.length)
      throw new InvariantViolationError('"days" may not repeat a weekday.')
  }

  const start = 'start' in raw ? raw.start : DEFAULT_POLICY.start
  const end = 'end' in raw ? raw.end : DEFAULT_POLICY.end
  if (typeof start !== 'string' || typeof end !== 'string')
    throw new InvariantViolationError(
      '"start" and "end" must be strings such as "08:00".',
    )
  if (minutesOf(start, 'start') >= minutesOf(end, 'end'))
    throw new InvariantViolationError(
      '"start" must be earlier than "end" on the same day.',
    )

  if ('timezone' in raw) {
    const timezone = raw.timezone
    if (typeof timezone !== 'string' || timezone.trim().length === 0)
      throw new InvariantViolationError(
        '"timezone" must be an IANA name such as "Asia/Damascus".',
      )
    try {
      // The only reliable way to know the platform accepts a zone is to ask it.
      new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    } catch {
      throw new InvariantViolationError(
        `Unknown timezone "${timezone}". Use an IANA name such as "Asia/Damascus".`,
      )
    }
  }
}

/**
 * Guards the numbering scheme by building it. The value object already owns
 * every rule (the pattern must contain {seq}, padding 0-12, 2 or 4 year
 * digits, a known reset policy), so re-stating them here could only let the
 * two drift apart.
 */
function validateNumbering(value: unknown): void {
  const raw = asRecord(value, REQUEST_NUMBERING_SETTING_KEY)
  NumberingScheme.create(raw as NumberingSchemeConfig)
}

/**
 * The settings an administrator may read and write over HTTP.
 *
 * An allow-list rather than a free-form key/value store, on purpose. A setting
 * only means something because code reads it; accepting arbitrary keys would
 * invite rows that look configured and change nothing, and would leave the API
 * with no idea what a valid value is. Adding a setting is therefore a
 * deliberate act: register it here with its validator.
 */
export const SETTING_DEFINITIONS: SettingDefinition[] = [
  {
    key: WORKING_HOURS_SETTING_KEY,
    description:
      'Weekly working schedule used for SLA due dates, the working-hours guard, and recorded durations.',
    defaultValue: DEFAULT_POLICY,
    validate: validateWorkingHours,
    invalidatesWorkingHours: true,
  },
  {
    key: REQUEST_NUMBERING_SETTING_KEY,
    description:
      'Format of human-readable request reference numbers, e.g. REQ-2026-00042.',
    defaultValue: DEFAULT_NUMBERING,
    validate: validateNumbering,
    invalidatesWorkingHours: false,
  },
]

/**
 * Resolves a key to its definition. An unknown key is a 404 rather than a 400:
 * the caller asked for a setting that does not exist, which is a wrong address,
 * not a malformed value.
 */
export function settingDefinition(key: string): SettingDefinition {
  const wanted = key.trim()
  const found = SETTING_DEFINITIONS.find(
    (definition) => definition.key === wanted,
  )
  if (!found) throw new EntityNotFoundError('Setting', key)
  return found
}
