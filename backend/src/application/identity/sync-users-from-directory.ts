import { User } from '../../domain/identity/user'
import { UserType } from '../../domain/identity/enums'
import { Email } from '../../domain/identity/value-objects/email'
import { PersonName } from '../../domain/identity/value-objects/person-name'
import { InstitutionalNumber } from '../../domain/identity/value-objects/institutional-number'
import type { UserRepository } from '../../domain/identity/ports/user.repository'
import type {
  DepartmentRepository,
  ExternalUser,
  PersonnelDirectory,
} from '../../domain/organization/ports/department.repository'
import { ExternalRef } from '../../domain/organization/value-objects/external-ref'
import type { IdGenerator } from '../../domain/shared/id-generator'
import type { TransactionRunner } from '../../domain/shared/transaction-runner'
import { Identifier } from '../../domain/shared/identifier'
import { InvariantViolationError } from '../../domain/shared/domain-error'
import { UpstreamUnavailableError } from '../errors'
import type { UserTypeAttributeWriter } from './services/user-type-attribute.writer'

/**
 * Accounts the sync creates authenticate against the institute's directory and
 * hold no local password.
 *
 * This is the whole point of importing people rather than typing them in: the
 * password stays in one system. When HR disables someone on Monday they lose
 * access here on Monday, with nobody remembering to do anything. A local copy
 * of an employee's password would be a second place their access lives on after
 * they leave, and a second place it can leak.
 *
 * The consequence, stated plainly: until an LDAP provider is registered in
 * AuthProviderRegistry, synced people cannot sign in. That is honest rather
 * than convenient -- the alternative is issuing passwords the institute never
 * authorised. Admin-created accounts (POST /users) remain LOCAL and are the
 * supported path for anyone the directory does not cover.
 */
const DIRECTORY_AUTH_PROVIDER = 'LDAP'

export interface SyncUsersResult {
  source: string
  /** New accounts, directory-authenticated. */
  created: number
  /** Existing directory accounts refreshed. */
  updated: number
  /** Self-registered applicants promoted to staff, keeping their id. */
  upgraded: number
  total: number
  /** Records deliberately not applied, each with the reason. */
  skipped: Array<{ institutionalNumber: string; reason: string }>
  /**
   * External department ids the feed referenced that no synced department
   * matched. The person is still imported, without a department -- reported
   * rather than fatal, because it usually means departments need syncing first.
   */
  unresolvedDepartments: string[]
}

/**
 * Idempotent import of people from the external personnel directory.
 *
 * Matching order, and why:
 *  1. institutional number -- unique in our table, stable in theirs, and the
 *     one identifier that survives someone changing their email.
 *  2. email -- catches the person who self-registered as an applicant before HR
 *     published them. That account is UPGRADED in place, never duplicated.
 *  3. otherwise create.
 *
 * Roles are deliberately not touched. The personnel system knows job titles,
 * not this system's permissions; letting an HR field decide who may approve a
 * request would mean a rename upstream silently changes authority here. An
 * administrator assigns roles through POST /users/:userId/roles as before.
 *
 * Like the department sync, everything is validated before anything is written
 * and the writes run as one transaction, so a bad record cannot leave a
 * half-imported roster behind.
 */
export class SyncUsersFromDirectory {
  constructor(
    private readonly directory: PersonnelDirectory,
    private readonly users: UserRepository,
    private readonly departments: DepartmentRepository,
    private readonly ids: IdGenerator,
    private readonly transaction: TransactionRunner,
    private readonly userTypeAttribute: UserTypeAttributeWriter,
  ) {}

  async execute(source: string): Promise<SyncUsersResult> {
    const people = await this.directory.fetchUsers()
    if (people === null)
      throw new UpstreamUnavailableError(
        'The personnel directory mapping has no `users:` block, so this ' +
          'directory does not publish people. Add one to enable user sync.',
      )

    // Pass 0 -- validate every user type before touching anything, reporting
    // all bad codes at once instead of one failed run at a time.
    const known = new Set<string>(Object.values(UserType))
    const bad = new Set<string>()
    for (const code of new Set(people.map((p) => p.userType))) {
      if (!known.has(code) || code === UserType.APPLICANT) bad.add(code)
    }
    if (bad.size > 0)
      throw new InvariantViolationError(
        `Unusable user type(s) ${[...bad].map((c) => `'${c}'`).join(', ')} ` +
          `received from ${source}. Map them to EMPLOYEE, STUDENT or ADMIN in ` +
          'userTypeMap; APPLICANT is not importable because applicants ' +
          'self-register. Nothing was imported.',
      )

    return this.transaction.run(() => this.write(people, source, new Date()))
  }

  /** The write half, run as one unit of work by `execute`. */
  private async write(
    people: ExternalUser[],
    source: string,
    syncedAt: Date,
  ): Promise<SyncUsersResult> {
    const result: SyncUsersResult = {
      source,
      created: 0,
      updated: 0,
      upgraded: 0,
      total: people.length,
      skipped: [],
      unresolvedDepartments: [],
    }
    const departmentCache = new Map<string, Identifier | undefined>()

    for (const person of people) {
      const number = InstitutionalNumber.create(person.institutionalNumber)
      const name = PersonName.create(person.name.ar, person.name.en)
      const email = Email.create(person.email)
      const departmentId = await this.resolveDepartment(
        person.departmentExternalId,
        source,
        departmentCache,
        result,
      )

      // 1. Known directory person -> refresh, keep everything else as it is.
      const byNumber = await this.users.findByInstitutionalNumber(number)
      if (byNumber) {
        byNumber.applyDirectoryUpdate({ name, email, departmentId }, syncedAt)
        await this.users.save(byNumber)
        // Imported people need the ABAC attribute as much as created ones do,
        // and refreshing it here also repairs anyone imported before this ran.
        await this.userTypeAttribute.write(byNumber.id, byNumber.type)
        result.updated += 1
        continue
      }

      // 2. Same address already in use.
      const byEmail = await this.users.findByEmail(email)
      if (byEmail) {
        if (byEmail.type !== UserType.APPLICANT) {
          // A different member of staff already holds this address. Two people
          // cannot share one, and guessing which record is right is not the
          // sync's call to make -- report it for a human.
          result.skipped.push({
            institutionalNumber: person.institutionalNumber,
            reason: `Email ${person.email} already belongs to another non-applicant account.`,
          })
          continue
        }
        byEmail.upgradeToDirectoryUser({
          type: person.userType as UserType,
          institutionalNumber: number,
          name,
          phone: person.phone,
          departmentId,
          syncedAt,
        })
        await this.users.save(byEmail)
        // The type just changed from APPLICANT to staff, so the attribute has
        // to change with it or eligibility still treats them as an applicant.
        await this.userTypeAttribute.write(byEmail.id, byEmail.type)
        result.upgraded += 1
        continue
      }

      // 3. Nobody here yet -> a fresh directory-authenticated account.
      const created = User.fromExternal(this.ids.next(), {
          type: person.userType as UserType,
          name,
          email,
          institutionalNumber: number,
          authProvider: DIRECTORY_AUTH_PROVIDER,
          phone: person.phone,
          departmentId,
          syncedAt,
      })
      await this.users.save(created)
      await this.userTypeAttribute.write(created.id, created.type)
      result.created += 1
    }

    return result
  }

  /**
   * Maps the feed's department external id onto an internal one, using the
   * departments imported by the department sync from the same source.
   */
  private async resolveDepartment(
    externalId: string | null,
    source: string,
    cache: Map<string, Identifier | undefined>,
    result: SyncUsersResult,
  ): Promise<Identifier | undefined> {
    if (!externalId) return undefined
    if (cache.has(externalId)) return cache.get(externalId)

    const department = await this.departments.findByExternalRef(
      ExternalRef.create(externalId, source),
    )
    const id = department?.id
    cache.set(externalId, id)
    if (!id) result.unresolvedDepartments.push(externalId)
    return id
  }
}
