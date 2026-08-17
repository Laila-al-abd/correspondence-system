/**
 * An in-memory PersonnelDirectory for end-to-end tests.
 *
 * The sync use-cases are the only part of this system whose input comes from a
 * service we do not own, which makes them the only part that cannot be tested
 * by preparing rows. This class is the seam: it implements the same outbound
 * port that HttpPersonnelDirectory implements, so the test decides what the
 * university published today and everything downstream -- controller, command
 * bus, use-case, transaction, Prisma -- runs for real against Postgres.
 *
 * Deliberately dumb. It does no mapping, because the YAML mapping is a separate
 * concern with its own pure functions (toExternalOrgUnit / toExternalUser), and
 * a fake that re-implemented it would be testing itself. What it does model is
 * the one behaviour of the real adapter that the use-cases branch on:
 * fetchUsers() returning null when the directory publishes no people feed.
 */
import type {
  ExternalOrgUnit,
  ExternalUser,
  PersonnelDirectory,
} from '../src/domain/organization/ports/department.repository'

export class FakePersonnelDirectory implements PersonnelDirectory {
  private units: ExternalOrgUnit[] = []
  private users: ExternalUser[] | null = []

  /** How many times each feed was read, so a test can prove a sync ran. */
  readonly reads = { units: 0, users: 0 }

  setUnits(units: ExternalOrgUnit[]): void {
    this.units = units
  }

  /** Pass null to model a mapping file with no `users:` block. */
  setUsers(users: ExternalUser[] | null): void {
    this.users = users
  }

  async fetchUnits(): Promise<ExternalOrgUnit[]> {
    this.reads.units += 1
    return this.units.map((unit) => ({ ...unit }))
  }

  async fetchUsers(): Promise<ExternalUser[] | null> {
    this.reads.users += 1
    return this.users === null ? null : this.users.map((user) => ({ ...user }))
  }
}
