// src/types/settings.ts
//
// Mirrors:
//  - backend/src/application/observability/queries/views/setting.view.ts
//  - backend/src/application/observability/settings/setting-keys.ts
//  - backend/src/domain/request/value-objects/numbering-scheme.ts
//  - backend/src/application/observability/services/business-hours.service.ts

/** A settings key as listed by GET /settings. */
export interface SettingKeyView {
  key: string;
  description: string;
}

/**
 * One setting as GET /settings/:key returns it.
 *
 * `value` is unknown because every key is a different JSON document; narrow it
 * with the guards below rather than casting at the call site.
 *
 * `configured` false means no row exists yet and `value` is the default that is
 * actually in force -- not that the setting is missing.
 */
export interface SettingView {
  key: string;
  value: unknown;
  description?: string;
  configured: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

/** The two keys this build supports. Kept as constants so no string is typed twice. */
export const WORKING_HOURS_KEY = 'working_hours';
export const REQUEST_NUMBERING_KEY = 'request_numbering';

/** working_hours. `days` uses 0 = Sunday, matching Date.getDay(). */
export interface WorkingHoursPolicy {
  enabled: boolean;
  days: number[];
  start: string;
  end: string;
  timezone: string;
}

export type NumberingResetPolicy = 'YEARLY' | 'MONTHLY' | 'NEVER';

/** request_numbering. */
export interface NumberingScheme {
  pattern: string;
  prefix: string;
  seqPadding: number;
  resetPolicy: NumberingResetPolicy;
  yearDigits: number;
}

/**
 * Defaults duplicated from the backend registry so the form can render before
 * the first response arrives, and so a malformed row does not leave the screen
 * blank. The server remains the authority: it validates and re-serves whatever
 * is saved.
 */
export const DEFAULT_WORKING_HOURS: WorkingHoursPolicy = {
  enabled: true,
  days: [0, 1, 2, 3, 4],
  start: '08:00',
  end: '15:30',
  timezone: 'Asia/Damascus',
};

export const DEFAULT_NUMBERING: NumberingScheme = {
  pattern: '{prefix}-{year}-{seq}',
  prefix: 'REQ',
  seqPadding: 5,
  resetPolicy: 'YEARLY',
  yearDigits: 4,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads a working-hours value field by field, falling back per field.
 *
 * Deliberately forgiving, for the same reason BusinessHoursService is forgiving
 * at read time: a half-written row must not produce an unusable form, because
 * the form is the only way to repair it.
 */
export function asWorkingHours(value: unknown): WorkingHoursPolicy {
  if (!isRecord(value)) return { ...DEFAULT_WORKING_HOURS };
  const days = Array.isArray(value.days)
    ? value.days.filter(
        (day): day is number => typeof day === 'number' && day >= 0 && day <= 6,
      )
    : DEFAULT_WORKING_HOURS.days;
  return {
    enabled:
      typeof value.enabled === 'boolean'
        ? value.enabled
        : DEFAULT_WORKING_HOURS.enabled,
    days: days.length > 0 ? days : DEFAULT_WORKING_HOURS.days,
    start:
      typeof value.start === 'string' ? value.start : DEFAULT_WORKING_HOURS.start,
    end: typeof value.end === 'string' ? value.end : DEFAULT_WORKING_HOURS.end,
    timezone:
      typeof value.timezone === 'string' && value.timezone.trim().length > 0
        ? value.timezone
        : DEFAULT_WORKING_HOURS.timezone,
  };
}

export function asNumberingScheme(value: unknown): NumberingScheme {
  if (!isRecord(value)) return { ...DEFAULT_NUMBERING };
  const reset = value.resetPolicy;
  return {
    pattern:
      typeof value.pattern === 'string' && value.pattern.length > 0
        ? value.pattern
        : DEFAULT_NUMBERING.pattern,
    prefix:
      typeof value.prefix === 'string' ? value.prefix : DEFAULT_NUMBERING.prefix,
    seqPadding:
      typeof value.seqPadding === 'number'
        ? value.seqPadding
        : DEFAULT_NUMBERING.seqPadding,
    resetPolicy:
      reset === 'YEARLY' || reset === 'MONTHLY' || reset === 'NEVER'
        ? reset
        : DEFAULT_NUMBERING.resetPolicy,
    yearDigits:
      value.yearDigits === 2 || value.yearDigits === 4
        ? value.yearDigits
        : DEFAULT_NUMBERING.yearDigits,
  };
}

/** Weekday labels, index = Date.getDay(). */
export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * An illustrative reference number for the scheme on screen.
 *
 * Approximate on purpose: the server owns the real substitution, and this
 * exists so an administrator can see the shape of what they are about to save
 * before they save it. Unknown tokens are left in place rather than blanked, so
 * a typo like {yaer} stays visible instead of silently disappearing.
 */
export function previewReferenceNumber(scheme: NumberingScheme): string {
  const now = new Date();
  const year =
    scheme.yearDigits === 2
      ? String(now.getFullYear()).slice(-2)
      : String(now.getFullYear());
  const padding = Math.max(0, Math.min(12, scheme.seqPadding));
  return scheme.pattern
    .replace(/\{prefix\}/g, scheme.prefix)
    .replace(/\{year\}/g, year)
    .replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'))
    .replace(/\{seq\}/g, String(42).padStart(padding, '0'));
}
