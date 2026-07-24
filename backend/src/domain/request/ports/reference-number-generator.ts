/**
 * Allocates the next human-readable request reference number (e.g.
 * "REQ-2026-00042"). Implemented in the infrastructure layer, where it loads
 * the institution's numbering configuration and atomically reserves the next
 * sequence value from the database.
 */
export interface ReferenceNumberGenerator {
  next(at?: Date): Promise<string>
}
