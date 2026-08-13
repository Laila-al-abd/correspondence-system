/**
 * The smoke test: does the whole application actually stand up?
 *
 * Every other e2e file assumes a booted app. This one proves it, and it is the
 * file to run first when something is wrong, because it fails for a completely
 * different set of reasons than a route test: a missing provider, an
 * unreachable database, a mistyped connection string.
 *
 * Replaces the Nest starter test that asserted "Hello World!" on GET /. That
 * assertion had stopped being true in spirit -- the interesting property of
 * this API is that it is CLOSED by default -- so both facts are asserted here
 * instead: the two deliberately public routes answer, and a route that is not
 * public refuses an anonymous caller.
 */
import type { INestApplication } from '@nestjs/common'
import { api, createTestApp } from './helpers/e2e-app'

describe('application bootstrap (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  }, 60_000)

  afterAll(async () => {
    await app?.close()
  })

  it('boots and answers the public root route', async () => {
    const response = await api(app).get('/')
    expect(response.status).toBe(200)
  })

  it('answers the public liveness probe', async () => {
    const response = await api(app).get('/health')
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('refuses an anonymous caller on a protected route', async () => {
    const response = await api(app).get('/auth/me/permissions')
    expect(response.status).toBe(401)
  })
})
