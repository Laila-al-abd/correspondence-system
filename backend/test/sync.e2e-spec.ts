/**
 * Directory sync, end to end.
 *
 * What makes this file worth having: the sync is the one use-case whose input
 * arrives from a system we do not own. Testing it by hand means standing up a
 * fake HTTP service, editing a YAML mapping, pointing an environment variable
 * at it and reading a JSON summary -- for every case. And the interesting cases
 * are precisely the ones that are painful to stage by hand: a directory that
 * stops sending a unit, a person who self-registered before HR published them,
 * two records claiming one email address.
 *
 * So the personnel directory port is replaced with an in-memory feed and
 * everything else runs for real: the HTTP route, the permission guard, the
 * command bus, the use-case, the transaction, Prisma, Postgres. What is proven
 * here is therefore not "the sync function returns the right object" but "the
 * rows in the database afterwards are the right rows".
 *
 * Two invariants are asserted repeatedly because they are the whole point of
 * the design:
 *   - Internal ids SURVIVE a re-sync. Every foreign key in the system points at
 *     them; a sync that re-created rows would silently orphan history.
 *   - A refused sync writes NOTHING. Validation happens before the first write
 *     and the writes share one transaction, so a bad feed is a failed run and
 *     not a half-imported roster.
 *
 * Requires: docker compose up -d, migrations applied to the test database, and
 * npm run test:e2e:reset once (the seed supplies the org-unit types, the
 * user_type attribute definition and the admin account this file signs in as).
 *
 * Self-cleaning: everything it creates carries the source label 'e2e-directory'
 * or an @e2e.local email address, and afterAll deletes exactly those rows. The
 * seeded data is left untouched, so this file may be run repeatedly without a
 * reset.
 */
import type { INestApplication } from '@nestjs/common'
import { api, createTestApp, login, prismaOf } from './helpers/e2e-app'
import { PERSONNEL_DIRECTORY } from '../src/application/tokens'
import { FakePersonnelDirectory } from '../test-support/fake-personnel-directory'

const ADMIN = { email: 'admin@correspondence.local', password: 'Admin@12345' }

/** The source label. Both feeds must use the same one or department lookups miss. */
const SOURCE = 'e2e-directory'

const FACULTY = 'E2E-FAC'
const DEPARTMENT = 'E2E-DEP'

const faculty = {
  externalId: FACULTY,
  parentExternalId: null,
  name: { ar: 'كلية الاختبار', en: 'Test Faculty' },
  unitType: 'FACULTY',
}
const department = {
  externalId: DEPARTMENT,
  parentExternalId: FACULTY,
  name: { ar: 'قسم الاختبار', en: 'Test Department' },
  unitType: 'DEPARTMENT',
}

describe('directory sync (e2e)', () => {
  let app: INestApplication
  let token: string
  const directory = new FakePersonnelDirectory()

  /** Ids captured on the first sync, compared after every later one. */
  const ids: Record<string, string> = {}

  beforeAll(async () => {
    app = await createTestApp([
      { token: PERSONNEL_DIRECTORY, value: directory },
    ])
    token = await login(app, ADMIN.email, ADMIN.password)
    await cleanUp()
  }, 90_000)

  afterAll(async () => {
    if (!app) return
    await cleanUp()
    await app.close()
  })

  /** Removes only what this file creates. Order respects the foreign keys. */
  async function cleanUp(): Promise<void> {
    const prisma = prismaOf(app)
    const mine = `SELECT id FROM users WHERE email LIKE '%@e2e.local'`
    await prisma.$executeRawUnsafe(
      `DELETE FROM event_logs WHERE actor_id IN (${mine})`,
    )
    await prisma.$executeRawUnsafe(
      `DELETE FROM notifications WHERE user_id IN (${mine})`,
    )
    await prisma.$executeRawUnsafe(
      `DELETE FROM user_attributes WHERE user_id IN (${mine})`,
    )
    await prisma.$executeRawUnsafe(
      `DELETE FROM user_roles WHERE user_id IN (${mine})`,
    )
    await prisma.$executeRawUnsafe(
      `DELETE FROM users WHERE email LIKE '%@e2e.local'`,
    )
    await prisma.$executeRawUnsafe(
      `DELETE FROM departments WHERE source_system = '${SOURCE}'`,
    )
  }

  const syncDepartments = () =>
    api(app)
      .post('/organization/departments/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: SOURCE })

  const syncUsers = () =>
    api(app)
      .post('/users/sync')
      .query({ source: SOURCE })
      .set('Authorization', `Bearer ${token}`)
      .send({})

  const unit = (externalId: string) =>
    prismaOf(app).department.findFirst({ where: { externalId } })

  const person = (email: string) =>
    prismaOf(app).user.findFirst({ where: { email } })

  /** The ABAC attribute, read through the API rather than the table. */
  async function userTypeAttribute(userId: string): Promise<unknown> {
    const response = await api(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    const attributes = response.body.attributes as Array<{
      attributeCode: string
      value: unknown
    }>
    return attributes.find((a) => a.attributeCode === 'user_type')?.value
  }

  // ── departments ─────────────────────────────────────────────────────────
  describe('department sync', () => {
    it('imports a tree and wires the parent link', async () => {
      directory.setUnits([department, faculty]) // child first, on purpose

      const response = await syncDepartments()

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        source: SOURCE,
        created: 2,
        updated: 0,
        deactivated: 0,
        total: 2,
      })

      const importedFaculty = await unit(FACULTY)
      const importedDepartment = await unit(DEPARTMENT)
      expect(importedFaculty).not.toBeNull()
      expect(importedDepartment).not.toBeNull()
      // Parents are wired in a second pass, so order in the feed is irrelevant.
      expect(importedDepartment!.parentId).toBe(importedFaculty!.id)
      expect(importedDepartment!.sourceSystem).toBe(SOURCE)
      expect(importedDepartment!.lastSyncedAt).not.toBeNull()

      ids[FACULTY] = importedFaculty!.id
      ids[DEPARTMENT] = importedDepartment!.id
    })

    it('is idempotent: a second run updates in place and keeps the ids', async () => {
      directory.setUnits([faculty, department])

      const response = await syncDepartments()

      expect(response.body).toMatchObject({ created: 0, updated: 2, total: 2 })
      expect((await unit(FACULTY))!.id).toBe(ids[FACULTY])
      expect((await unit(DEPARTMENT))!.id).toBe(ids[DEPARTMENT])
    })

    it('refuses an unknown unit type and writes nothing at all', async () => {
      directory.setUnits([
        faculty,
        department,
        {
          externalId: 'E2E-NEW',
          parentExternalId: FACULTY,
          name: { ar: 'وحدة مجهولة النوع' },
          unitType: 'GALAXY',
        },
      ])

      const response = await syncDepartments()

      expect(response.status).toBe(400)
      expect(String(response.body.message)).toContain('GALAXY')
      // The valid units in the same feed must not have been imported either.
      expect(await unit('E2E-NEW')).toBeNull()
    })

    it('deactivates a unit the directory stops sending, and revives it later', async () => {
      directory.setUnits([faculty])
      const dropped = await syncDepartments()
      expect(dropped.body).toMatchObject({ updated: 1, deactivated: 1 })

      const switchedOff = await unit(DEPARTMENT)
      expect(switchedOff!.isActive).toBe(false)
      // Never deleted: requests and role assignments still point at this id.
      expect(switchedOff!.id).toBe(ids[DEPARTMENT])

      directory.setUnits([faculty, department])
      const restored = await syncDepartments()
      expect(restored.body).toMatchObject({ updated: 2, deactivated: 0 })
      const revived = await unit(DEPARTMENT)
      expect(revived!.isActive).toBe(true)
      expect(revived!.id).toBe(ids[DEPARTMENT])
    })
  })

  // ── people ──────────────────────────────────────────────────────────────
  describe('user sync', () => {
    const employee = {
      institutionalNumber: 'E2E-1001',
      name: { ar: 'موظف الاختبار', en: 'Test Employee' },
      email: 'e2e.employee@e2e.local',
      phone: undefined,
      userType: 'EMPLOYEE',
      departmentExternalId: DEPARTMENT,
    }

    it('creates a directory-authenticated account in the resolved unit', async () => {
      directory.setUsers([employee])

      const response = await syncUsers()

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        created: 1,
        updated: 0,
        upgraded: 0,
        total: 1,
      })
      expect(response.body.skipped).toEqual([])
      expect(response.body.unresolvedDepartments).toEqual([])

      const imported = await person(employee.email)
      expect(imported).not.toBeNull()
      expect(imported!.departmentId).toBe(ids[DEPARTMENT])
      expect(imported!.institutionalNumber).toBe('E2E-1001')
      expect(imported!.status).toBe('ACTIVE')
      // No local password: the institute keeps the credential.
      expect(imported!.authProvider).toBe('LDAP')
      expect(imported!.passwordHash).toBeNull()
      // The ABAC attribute is written too, or eligibility rules would not see them.
      expect(await userTypeAttribute(imported!.id)).toBe('EMPLOYEE')

      ids[employee.email] = imported!.id
    })

    it('is idempotent: the same person is refreshed, not duplicated', async () => {
      directory.setUsers([
        { ...employee, name: { ar: 'موظف الاختبار', en: 'Renamed Employee' } },
      ])

      const response = await syncUsers()

      expect(response.body).toMatchObject({ created: 0, updated: 1 })
      const refreshed = await person(employee.email)
      expect(refreshed!.id).toBe(ids[employee.email])
      expect(refreshed!.fullNameEn).toBe('Renamed Employee')
    })

    it('imports a person whose unit is unknown, and reports the unit', async () => {
      const orphan = {
        ...employee,
        institutionalNumber: 'E2E-1002',
        email: 'e2e.orphan@e2e.local',
        departmentExternalId: 'E2E-NOT-SYNCED',
      }
      directory.setUsers([orphan])

      const response = await syncUsers()

      expect(response.body).toMatchObject({ created: 1 })
      expect(response.body.unresolvedDepartments).toContain('E2E-NOT-SYNCED')
      const imported = await person(orphan.email)
      expect(imported!.departmentId).toBeNull()
    })

    it('upgrades a self-registered applicant IN PLACE, keeping the same id', async () => {
      const email = 'e2e.applicant@e2e.local'
      const registration = await api(app).post('/auth/register').send({
        fullNameAr: 'مقدّم طلب الاختبار',
        fullNameEn: 'Test Applicant',
        email,
        password: 'Applicant@12345',
      })
      expect([200, 201, 202]).toContain(registration.status)

      const before = await person(email)
      expect(before!.userType).toBe('APPLICANT')
      const originalId = before!.id

      directory.setUsers([
        {
          institutionalNumber: 'E2E-2002',
          name: { ar: 'مقدّم طلب الاختبار', en: 'Test Applicant' },
          email,
          userType: 'STUDENT',
          departmentExternalId: DEPARTMENT,
        },
      ])

      const response = await syncUsers()

      expect(response.body).toMatchObject({ created: 0, upgraded: 1 })
      const after = await person(email)
      // The identity is the same row: every request they already submitted
      // still belongs to them.
      expect(after!.id).toBe(originalId)
      expect(after!.userType).toBe('STUDENT')
      expect(after!.institutionalNumber).toBe('E2E-2002')
      expect(after!.departmentId).toBe(ids[DEPARTMENT])
      // The attribute must move with the type or eligibility still says APPLICANT.
      expect(await userTypeAttribute(originalId)).toBe('STUDENT')
    })

    it('skips a record whose email belongs to another non-applicant account', async () => {
      directory.setUsers([
        {
          institutionalNumber: 'E2E-3003',
          name: { ar: 'مزدوج' },
          email: ADMIN.email,
          userType: 'EMPLOYEE',
          departmentExternalId: null,
        },
      ])

      const response = await syncUsers()

      expect(response.body).toMatchObject({ created: 0, updated: 0, upgraded: 0 })
      expect(response.body.skipped).toHaveLength(1)
      expect(String(response.body.skipped[0].reason)).toContain(
        'already belongs',
      )
    })

    it('refuses a feed containing an unimportable type, importing none of it', async () => {
      directory.setUsers([
        {
          institutionalNumber: 'E2E-4004',
          name: { ar: 'صالح' },
          email: 'e2e.valid@e2e.local',
          userType: 'EMPLOYEE',
          departmentExternalId: DEPARTMENT,
        },
        {
          institutionalNumber: 'E2E-4005',
          name: { ar: 'مقدّم طلب' },
          email: 'e2e.applicant2@e2e.local',
          userType: 'APPLICANT',
          departmentExternalId: null,
        },
      ])

      const response = await syncUsers()

      expect(response.status).toBe(400)
      expect(String(response.body.message)).toContain('APPLICANT')
      // All-or-nothing: the valid record in the same batch is not imported.
      expect(await person('e2e.valid@e2e.local')).toBeNull()
    })

    it('reports a directory that publishes no people feed', async () => {
      directory.setUsers(null)

      const response = await syncUsers()

      expect(response.status).toBe(502)
      expect(String(response.body.message)).toContain('users:')
    })
  })
})
