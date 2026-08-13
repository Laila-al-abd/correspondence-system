/**
 * The permission matrix.
 *
 * One test file that asks, for a handful of representative routes: what does an
 * anonymous caller get, what does a member of staff with only request
 * permissions get, and what does an administrator get? Three columns, and the
 * interesting cell is the middle one -- 403 for a signed-in user is the answer
 * that proves authorisation is being enforced rather than merely authentication.
 *
 * It also happens to be the cheapest possible regression test for the two bugs
 * that hurt most in this project: a CQRS handler that was never registered, and
 * a route declared after a wildcard route. Both fail on the FIRST REAL REQUEST
 * and boot perfectly, so only a request can catch them. Every assertion below
 * is a request.
 *
 * Read-only by design, apart from one idempotent write that puts the working
 * hours setting back to the value it already had. So this file can be run
 * against the seeded test database as often as you like without resetting it.
 *
 * Requires: docker compose up -d, the migrations applied to the test database,
 * and npm run test:e2e:reset once.
 */
import type { INestApplication } from '@nestjs/common'
import { api, createTestApp, login } from './helpers/e2e-app'

const ADMIN = { email: 'admin@correspondence.local', password: 'Admin@12345' }
const REVIEWER = {
  email: 'reviewer1@correspondence.local',
  password: 'Review@12345',
}

/** Tolerates either a bare array or a wrapped object from /auth/me/permissions. */
function permissionCodes(body: unknown): string[] {
  if (Array.isArray(body)) return body as string[]
  const wrapped = body as { permissions?: string[]; codes?: string[] }
  return wrapped?.permissions ?? wrapped?.codes ?? []
}

describe('permission matrix (e2e)', () => {
  let app: INestApplication
  let adminToken: string
  let reviewerToken: string

  beforeAll(async () => {
    app = await createTestApp()
    adminToken = await login(app, ADMIN.email, ADMIN.password)
    reviewerToken = await login(app, REVIEWER.email, REVIEWER.password)
  }, 60_000)

  afterAll(async () => {
    await app?.close()
  })

  const get = (path: string, token?: string) => {
    const call = api(app).get(path)
    return token ? call.set('Authorization', `Bearer ${token}`) : call
  }

  // ── anonymous ───────────────────────────────────────────────────────────
  describe('an anonymous caller', () => {
    it('may read the liveness probe', async () => {
      const response = await get('/health')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })

    it('is refused everything else', async () => {
      for (const path of [
        '/settings',
        '/health/detailed',
        '/reports/overview',
        '/auth/me/permissions',
      ]) {
        const response = await get(path)
        expect([401, 403]).toContain(response.status)
      }
    })

    it('is refused a forged token', async () => {
      const response = await get('/settings', 'not.a.real.token')
      expect(response.status).toBe(401)
    })
  })

  // ── staff without administrative rights ───────────────────────────────────
  describe('a reviewer', () => {
    it('holds exactly the request permissions', async () => {
      const response = await get('/auth/me/permissions', reviewerToken)
      expect(response.status).toBe(200)
      const codes = permissionCodes(response.body)
      expect(codes).toContain('request.read')
      expect(codes).toContain('request.act')
      expect(codes).not.toContain('system.monitor')
      expect(codes).not.toContain('user.manage')
    })

    it('is refused the operator and administrator routes', async () => {
      for (const path of [
        '/settings',
        '/health/detailed',
        '/auth/admin/ping',
        '/reports/overview',
      ]) {
        const response = await get(path, reviewerToken)
        // 403, not 401: the caller is known, and known to be insufficient.
        expect(response.status).toBe(403)
      }
    })
  })

  // ── administrator ─────────────────────────────────────────────────────
  describe('an administrator', () => {
    it('may call a route guarded by user.manage', async () => {
      const response = await get('/auth/admin/ping', adminToken)
      expect(response.status).toBe(200)
    })

    it('may read detailed health', async () => {
      const response = await get('/health/detailed', adminToken)
      // 503 is a legitimate answer -- it means MinIO or Postgres is down, not
      // that authorisation failed. Anything else here is a wiring problem.
      expect([200, 503]).toContain(response.status)
    })

    it('sees the editable settings registry', async () => {
      const response = await get('/settings', adminToken)
      expect(response.status).toBe(200)
      const keys = (response.body as Array<{ key: string }>).map(
        (entry) => entry.key,
      )
      expect(keys).toContain('working_hours')
      expect(keys).toContain('request_numbering')
    })

    it('reads a setting that has no row yet, with its defaults', async () => {
      const response = await get('/settings/working_hours', adminToken)
      expect(response.status).toBe(200)
      expect(response.body.key).toBe('working_hours')
      // `configured` distinguishes "nobody has set this" from "set to the
      // defaults", which is why the endpoint answers 200 and not 404.
      expect(typeof response.body.configured).toBe('boolean')
      expect(response.body.value).toBeDefined()
    })

    it('answers 404 for a key this build does not support', async () => {
      const response = await get('/settings/colour_of_the_logo', adminToken)
      expect(response.status).toBe(404)
    })

    it('rejects an invalid working-hours policy with 400', async () => {
      const response = await api(app)
        .put('/settings/working_hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: {
            enabled: true,
            days: [0, 1, 2, 3, 4],
            start: '17:00',
            end: '08:00', // the working day cannot end before it starts
            timezone: 'Asia/Damascus',
          },
        })
      expect(response.status).toBe(400)
    })

    it('accepts a valid working-hours policy', async () => {
      // Writes back exactly what is already stored, so the suite is repeatable.
      const current = await get('/settings/working_hours', adminToken)
      const response = await api(app)
        .put('/settings/working_hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: current.body.value })
      expect([200, 201]).toContain(response.status)
      expect(response.body.configured).toBe(true)
    })
  })
})
