/**
 * Loads backend/.env.test into process.env.
 *
 * Kept apart from e2e-app.ts so scripts that must not drag the whole Nest
 * application into memory -- reset-test-db.ts, for instance -- can reuse it.
 *
 * Values here OVERRIDE anything already in the environment. That is deliberate:
 * @nestjs/config refuses to overwrite an existing process.env entry, so if the
 * developer's shell (or a stray .env) exports DATABASE_URL, a test run would
 * quietly point at the development database. Overriding first is what makes the
 * test database non-negotiable.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ENV_FILE = join(__dirname, '..', '..', '.env.test')

export function loadTestEnv(): void {
  if (!existsSync(ENV_FILE))
    throw new Error(
      `Missing ${ENV_FILE}. Copy .env.test from the repository root of the backend and set DATABASE_URL to your test database.`,
    )

  for (const rawLine of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line.length === 0 || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1)
    process.env[key] = value
  }

  assertTestDatabase()
}

/**
 * The safety catch. Every destructive helper calls this, so a mistyped
 * connection string costs a failed test rather than the data you demo from.
 */
export function assertTestDatabase(): void {
  const url = process.env.DATABASE_URL ?? ''
  if (!/test/i.test(url))
    throw new Error(
      `Refusing to run: DATABASE_URL does not look like a test database.\n` +
        `  DATABASE_URL = ${url || '(unset)'}\n` +
        `The name must contain "test", e.g. .../correspondence_test?schema=public`,
    )
}
