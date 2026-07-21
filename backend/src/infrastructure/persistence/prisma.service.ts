import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client'

/**
 * Single shared Prisma client, using the Prisma 7 driver adapter (pg).
 *
 * The connection string is read through ConfigService rather than
 * process.env.DATABASE_URL directly: Nest does NOT load .env on its own (only
 * the Prisma CLI does, via prisma.config.ts), so a global ConfigModule is what
 * makes DATABASE_URL available at runtime. getOrThrow fails fast with a clear
 * message at startup if the variable is missing, instead of surfacing later as
 * a cryptic pg "client password must be a string" error.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
