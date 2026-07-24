import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client'
import { auditStampingExtension } from './audit-stamping.extension'

/**
 * Single shared Prisma client, using the Prisma 7 driver adapter (pg), with the
 * automatic audit-stamping extension applied.
 *
 * The connection string is read through ConfigService rather than
 * process.env.DATABASE_URL directly: Nest does NOT load .env on its own (only
 * the Prisma CLI does, via prisma.config.ts), so a global ConfigModule is what
 * makes DATABASE_URL available at runtime. getOrThrow fails fast with a clear
 * message at startup if the variable is missing.
 *
 * $extends returns a NEW client rather than mutating this one, so the
 * constructor returns the extended client (a constructor may return an object,
 * which `new` then yields). Every repository that injects PrismaService thus
 * gets the audited client transparently -- no repository code changes. Because
 * an extended client no longer carries the custom onModuleInit/onModuleDestroy
 * methods, connection lifecycle is driven from PersistenceModule instead, using
 * the $connect/$disconnect that extensions do preserve.
 */
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    })
    return this.$extends(auditStampingExtension) as unknown as PrismaService
  }
}
