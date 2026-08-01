/**
 * Runs a piece of work as a single unit: everything written inside it commits
 * together, or nothing does.
 *
 * The port lives in the domain next to IdGenerator because "these writes belong
 * together" is a rule of the business, not of Postgres. How that promise is
 * kept -- a database transaction, in our case -- is an infrastructure detail
 * the application layer never sees.
 */
export interface TransactionRunner {
  run<T>(work: () => Promise<T>): Promise<T>
}
