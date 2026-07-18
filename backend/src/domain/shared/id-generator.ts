import { Identifier } from './identifier'

/**
 * Outbound port for generating new aggregate identifiers. Keeping ID creation
 * behind a port lets the domain/application layers call `create(id, ...)`
 * without knowing whether ids come from a DB sequence, a snowflake generator,
 * or an in-memory counter (used in tests / not-yet-migrated contexts).
 */
export interface IdGenerator {
  next(): Identifier
}
