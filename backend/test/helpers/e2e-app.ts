/**
 * The end-to-end bootstrap.
 *
 * Starts the real application -- real modules, real guards, real Prisma, real
 * Postgres -- with the same pipeline main.ts installs, so a test exercises the
 * system the way a browser does and not a rearranged copy of it. Whatever is
 * missing here is a difference between test and production, which is why the
 * validation pipe, the exception filter and the request-context middleware are
 * all repeated: without the pipe a 400 becomes a 500, without the filter a
 * domain error becomes an unhandled 500, and without the middleware every write
 * loses its audit stamp.
 *
 * Two things are NOT repeated, on purpose:
 *   - app.listen(): supertest binds an ephemeral port itself.
 *   - Swagger and CORS: presentation for browsers, irrelevant to a test client.
 */
import { ValidationPipe, type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { DomainExceptionFilter } from '../../src/interface/shared/domain-exception.filter'
import { requestContextMiddleware } from '../../src/interface/shared/request-context.middleware'
import { PrismaService } from '../../src/infrastructure/persistence/prisma.service'
import { assertTestDatabase, loadTestEnv } from './test-env'

export async function createTestApp(): Promise<INestApplication> {
  // Before the module is compiled: PrismaService reads DATABASE_URL through
  // ConfigService during construction, so loading the env afterwards would be
  // too late.
  loadTestEnv()

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication()
  app.use(requestContextMiddleware)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new DomainExceptionFilter())
  await app.init()
  return app
}

/** The application's own Prisma client, so a test can read or seed rows directly. */
export function prismaOf(app: INestApplication): PrismaService {
  return app.get(PrismaService)
}

/** A supertest agent bound to the running application. */
export function api(app: INestApplication) {
  return request(app.getHttpServer())
}

/**
 * Empties every table except Prisma's migration ledger.
 *
 * Discovered from pg_tables rather than listed by hand: a list would go stale
 * the first time a migration adds a table, and a truncate helper that silently
 * misses a table is worse than none -- it leaves one row behind and the next
 * test fails somewhere unrelated.
 *
 * One statement, RESTART IDENTITY CASCADE, so foreign keys never dictate an
 * order and sequences (request numbering, above all) start clean.
 */
export async function truncateAll(app: INestApplication): Promise<void> {
  assertTestDatabase()
  const prisma = prismaOf(app)

  const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
  )
  if (tables.length === 0) return

  const list = tables
    .map((row) => `"public"."${row.tablename}"`)
    .join(', ')
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
  )
}

/**
 * Signs in and returns the bearer token.
 *
 * Through the real endpoint rather than by minting a token with the signing
 * key: the login route is part of what is under test, and a hand-made token
 * would keep passing after authentication broke.
 */
export async function login(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const response = await api(app).post('/auth/login').send({ email, password })
  if (response.status !== 200 && response.status !== 201)
    throw new Error(
      `Login failed for ${email}: HTTP ${response.status} ${JSON.stringify(
        response.body,
      )}\nHas the test database been seeded?  npm run test:e2e:reset`,
    )
  return response.body.accessToken as string
}
