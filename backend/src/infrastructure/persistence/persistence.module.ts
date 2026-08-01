import {
  Global,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { TRANSACTION_RUNNER } from '../../application/tokens'
import { PrismaService } from './prisma.service'
import { PrismaTransactionRunner } from './prisma-transaction-runner'

/**
 * Makes the shared PrismaService available application-wide. Imported once in
 * AppModule; feature modules can inject PrismaService without re-providing it.
 *
 * Connection lifecycle lives here rather than on PrismaService, because the
 * audit-stamping extension returns a client without the custom lifecycle
 * methods. $connect / $disconnect are preserved by extensions, so the module
 * opens the connection on startup and closes it on shutdown.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    PrismaTransactionRunner,
    // Two names for one object: infrastructure injects the class directly,
    // while application handlers depend only on the TransactionRunner port.
    // useExisting (not useClass) keeps it a single instance.
    { provide: TRANSACTION_RUNNER, useExisting: PrismaTransactionRunner },
  ],
  exports: [PrismaService, PrismaTransactionRunner, TRANSACTION_RUNNER],
})
export class PersistenceModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect()
  }
}
