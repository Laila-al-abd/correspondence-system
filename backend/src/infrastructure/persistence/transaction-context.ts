import { AsyncLocalStorage } from 'node:async_hooks'
import { Prisma } from '../../../generated/prisma/client'

/** The client a write should go through: a transaction client, or the plain one. */
export type DbClient = Prisma.TransactionClient

const storage = new AsyncLocalStorage<DbClient>()

/**
 * Carries the open transaction for the current unit of work.
 *
 * Without this, making several repositories share one transaction means adding
 * a `tx` parameter to every repository method, which drags a Prisma type
 * through the domain ports and infects every signature in the codebase. Instead
 * the transaction travels invisibly, exactly like the audit actor already does
 * in RequestContextStore, and each repository asks for "the client I should
 * write through right now".
 *
 * It is a plain module singleton rather than a Nest provider for the same
 * reason RequestContextStore is: infrastructure created outside the DI
 * container has to be able to reach it.
 */
export const TransactionContext = {
  /** Runs `callback` with `client` as the ambient transaction. */
  run<T>(client: DbClient, callback: () => Promise<T>): Promise<T> {
    return storage.run(client, callback)
  },

  /** The open transaction client, or undefined outside a unit of work. */
  client(): DbClient | undefined {
    return storage.getStore()
  },

  /** Whether a transaction is already open on this call stack. */
  isActive(): boolean {
    return storage.getStore() !== undefined
  },
}

/** The open transaction if there is one, otherwise the caller's own client. */
export function dbClient(fallback: DbClient): DbClient {
  return storage.getStore() ?? fallback
}
