/**
 * One page contract, used by every list endpoint in the system.
 *
 * Two shapes are offered because the lists differ in kind, not in taste.
 *
 * OffsetPage is for lists a person browses with page numbers: the admin user
 * directory, departments, delegations. It carries a total, so the UI can say
 * "page 3 of 47". Its weakness is that a row inserted while someone is on page
 * two shifts everything down, and one row slides from the top of page three to
 * the bottom of page two unseen. For an admin directory that is a cosmetic
 * annoyance.
 *
 * KeysetPage is for the request lists, where the same annoyance is not
 * cosmetic: a skipped row is a citizen's request that no reviewer ever opens.
 * Instead of "skip 40", the client says "continue after the last row I saw",
 * so insertions cannot shift anything out of view, and the cost of page 500 is
 * the same as the cost of page 1. The price is that there is no total and no
 * jumping to page twelve -- the UI is "load more", not numbered pages.
 *
 * The cursor is deliberately opaque: base64url over the ordering key. Clients
 * must treat it as a token to hand back, never as something to construct, so
 * the ordering key can change later without breaking them.
 */
import { ApplicationError } from '../errors'

export const DEFAULT_PAGE_SIZE = 50

/**
 * The hard ceiling. A caller asking for more is clamped, never refused -- and
 * because it is applied in the query layer rather than the controller, there
 * is no route into these lists that can ask the database for everything.
 */
export const MAX_PAGE_SIZE = 200

export interface OffsetPage<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface KeysetPage<T> {
  items: T[]
  limit: number
  /** Hand this back as `cursor` to get the next page. null means the end. */
  nextCursor: string | null
}

export class InvalidCursorError extends ApplicationError {
  readonly code = 'INVALID_CURSOR'
  readonly status = 400
  constructor() {
    super(
      'That page cursor is not one this endpoint issued. Start from the ' +
        'first page.',
    )
  }
}

export function clampLimit(raw?: number): number {
  if (raw === undefined || !Number.isFinite(raw)) return DEFAULT_PAGE_SIZE
  return Math.min(Math.max(Math.trunc(raw), 1), MAX_PAGE_SIZE)
}

export function clampOffset(raw?: number): number {
  if (raw === undefined || !Number.isFinite(raw)) return 0
  return Math.max(Math.trunc(raw), 0)
}

export function encodeCursor(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

/**
 * A malformed cursor is a client error, not a server one: it means someone
 * typed into the query string, or kept a token across a deploy that changed
 * the ordering. Either way the honest answer is 400 with an instruction --
 * not a 500, and not a silent fall back to page one, which would look to the
 * reader like the list had suddenly rewound.
 */
export function decodeCursor<T>(raw: string): T {
  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch {
    throw new InvalidCursorError()
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new InvalidCursorError()
  }
  return parsed as T
}
