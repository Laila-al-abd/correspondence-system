import { Injectable } from '@nestjs/common'
import { TransactionRunner } from '../../domain/shared/transaction-runner'
import { PrismaService } from './prisma.service'
import { DbClient, TransactionContext } from './transaction-context'

/*
 * A transaction holds database locks for as long as it is open, so it must not
 * be able to hang forever if something inside it stalls. Fifteen seconds is far
 * longer than any legitimate request write and short enough that a stuck one
 * releases its locks instead of blocking everybody else.
 */
const TRANSACTION_TIMEOUT_MS = 15_000

/**
 * Prisma-backed unit of work.
 *
 * If a transaction is already open on this call stack the work simply joins it,
 * because nesting a second transaction inside the first would create a
 * savepoint that can commit while its parent rolls back -- the exact atomicity
 * hole this class exists to close. Only the outermost caller opens a real
 * transaction, and only that caller's success commits it.
 */
@Injectable()
export class PrismaTransactionRunner implements TransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    if (TransactionContext.isActive()) return work()

    return this.prisma.$transaction(
      async (tx) => TransactionContext.run(tx as unknown as DbClient, work),
      { timeout: TRANSACTION_TIMEOUT_MS },
    )
  }
}
