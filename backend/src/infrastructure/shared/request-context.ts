import { AsyncLocalStorage } from 'node:async_hooks'

/** Values carried implicitly for the lifetime of a single request. */
export interface RequestContext {
  userId?: string
}

const storage = new AsyncLocalStorage<RequestContext>()

/**
 * A thin wrapper around AsyncLocalStorage. It lets code deep in the stack -- for
 * example the Prisma audit extension inside a repository -- read who the caller
 * is without that value being threaded through every method signature. The
 * store is a plain module singleton (not a Nest provider) so infrastructure
 * created outside the DI container, like the Prisma client extension, can reach
 * it directly.
 */
export const RequestContextStore = {
  /** Opens a fresh context for `callback` and every async continuation under it. */
  run<T>(context: RequestContext, callback: () => T): T {
    return storage.run(context, callback)
  },

  /** Merges values into the active context. No-op outside a request scope. */
  set(patch: Partial<RequestContext>): void {
    const current = storage.getStore()
    if (current) Object.assign(current, patch)
  },

  /** The current user id, or undefined for system work (seeds, jobs, startup). */
  userId(): string | undefined {
    return storage.getStore()?.userId
  },
}
