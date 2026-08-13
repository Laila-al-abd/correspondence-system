/**
 * Resets the test database: empty every table, then run the ordinary seed.
 *
 *   npm run test:e2e:reset
 *
 * Uses its own Prisma client rather than the application's, so the reset costs
 * no Nest bootstrap and cannot be blocked by an application that fails to start
 * -- which is exactly the situation in which you most need to reset.
 *
 * The seed is imported dynamically at the end. prisma/seed.ts executes on
 * import and calls dotenv, which never overwrites an existing variable, so the
 * DATABASE_URL loaded from .env.test above is the one it uses.
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { loadTestEnv } from './helpers/test-env'

async function main(): Promise<void> {
  loadTestEnv()
  const url = process.env.DATABASE_URL as string
  console.log(`Resetting ${url.replace(/:[^:@/]*@/, ':****@')}`)

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  })
  try {
    const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
    )
    if (tables.length === 0) {
      console.error(
        'No tables found. Run the migrations against the test database first:\n' +
          '  npx prisma migrate deploy   (with DATABASE_URL pointing at it)',
      )
      process.exit(1)
    }
    const list = tables.map((row) => `"public"."${row.tablename}"`).join(', ')
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
    )
    console.log(`Truncated ${tables.length} tables.`)
  } finally {
    await prisma.$disconnect()
  }

  console.log('Seeding...')
  await import('../prisma/seed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
