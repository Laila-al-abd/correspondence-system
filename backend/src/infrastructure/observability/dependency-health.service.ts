import { Inject, Injectable } from '@nestjs/common'
import type { ObjectStorage } from '../../domain/shared/object-storage'
import { OBJECT_STORAGE } from '../../application/tokens'
import { PrismaService } from '../persistence/prisma.service'

/**
 * How long a single dependency gets to answer before it is called down.
 *
 * A health check that can hang is worse than no health check: the monitor that
 * polls it blocks, the load balancer's own timeout fires instead, and the
 * reported reason becomes "the API is slow" rather than "Postgres is not
 * answering". Five seconds is far longer than a healthy local round-trip and
 * far shorter than any sensible monitor interval.
 */
const PROBE_TIMEOUT_MS = 5_000

export interface DependencyStatus {
  name: string
  status: 'up' | 'down'
  latencyMs: number
  error?: string
}

export interface HealthReport {
  status: 'ok' | 'degraded'
  checkedAt: string
  dependencies: DependencyStatus[]
}

/**
 * Probes the things the API cannot work without.
 *
 * Only two dependencies are checked, and that is the whole list on purpose: if
 * Postgres or MinIO is unreachable then every meaningful request fails, and if
 * both answer then the process is genuinely able to serve traffic. Probing
 * anything further would report failures the API can survive.
 *
 * Probes run concurrently and are individually timed, so one slow dependency
 * does not hide the state of the other, and the latency figures are useful on
 * their own -- a Postgres that answers in 4 seconds is a problem worth seeing
 * before it becomes an outage.
 */
@Injectable()
export class DependencyHealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async check(): Promise<HealthReport> {
    const dependencies = await Promise.all([
      this.probe('postgres', () => this.prisma.$queryRaw`SELECT 1`),
      this.probe('object-storage', () => this.storage.ping()),
    ])

    return {
      status: dependencies.every((d) => d.status === 'up') ? 'ok' : 'degraded',
      checkedAt: new Date().toISOString(),
      dependencies,
    }
  }

  private async probe(
    name: string,
    run: () => Promise<unknown>,
  ): Promise<DependencyStatus> {
    const startedAt = Date.now()
    try {
      await withTimeout(run(), PROBE_TIMEOUT_MS, name)
      return { name, status: 'up', latencyMs: Date.now() - startedAt }
    } catch (error) {
      return {
        name,
        status: 'down',
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}

function withTimeout<T>(
  work: Promise<T>,
  ms: number,
  name: string,
): Promise<T> {
  let timer: NodeJS.Timeout
  const expiry = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${name} did not respond within ${ms}ms`)),
      ms,
    )
  })
  // clearTimeout matters: without it the pending timer keeps the event loop
  // alive and a graceful shutdown waits out every probe it ever started.
  return Promise.race([work, expiry]).finally(() => clearTimeout(timer))
}
