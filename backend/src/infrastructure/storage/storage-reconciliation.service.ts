import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { DocumentRepository } from '../../domain/request/ports/document.repository'
import type { ObjectStorage } from '../../domain/shared/object-storage'
import { DOCUMENT_REPOSITORY, OBJECT_STORAGE } from '../../application/tokens'

const MS_PER_HOUR = 60 * 60 * 1000
/** How long a key is left alone before it can be called an orphan. */
const DEFAULT_GRACE_HOURS = 24
const DEFAULT_SWEEP_HOURS = 24
const PAGE_SIZE = 1000
/** Stops a misconfigured sweep from walking a bucket forever. */
const MAX_PAGES = 1000
const STARTUP_DELAY_MS = 30_000

export interface OrphanSample {
  key: string
  size: number
  lastModified: string
}

export interface ReconciliationReport {
  startedAt: string
  finishedAt: string
  /** Keys examined after the grace window was applied. */
  examined: number
  /** Keys skipped because they are younger than the grace window. */
  withinGrace: number
  orphans: number
  orphanBytes: number
  /** A handful of examples, for the operator reading the response. */
  sample: OrphanSample[]
  truncated: boolean
}

/** How many orphan keys are echoed back; the count is the real answer. */
const SAMPLE_LIMIT = 20

/**
 * Finds objects in the bucket that no document row points at.
 *
 * **This job never deletes anything.** It reports. An orphan is inferred from
 * the absence of a database row, and absence is exactly what a bug, a failed
 * migration, a restored-from-backup database, or a sweep pointed at the wrong
 * bucket all look like. The cost of a wrong "delete" here is a permanently lost
 * document belonging to a real person; the cost of a wrong "report" is a line
 * in a log. Those are not comparable, so the destructive half is not written
 * until the reporting half has been trusted for a while in production.
 *
 * Orphans arise legitimately: `save()` writes bytes to MinIO before the
 * document row is persisted, so a crash between the two leaves a file nobody
 * references. That ordering is the right one -- a row pointing at bytes that do
 * not exist is a broken download, while bytes nobody references are only wasted
 * disk -- and this sweep is the other half of that trade.
 *
 * The grace window is checked **before** any database comparison, not after.
 * An upload in flight right now has its bytes in the bucket and no row yet, and
 * would be reported as an orphan by a naive sweep. Filtering on age first means
 * such a key is never even looked up, which also keeps the query small.
 *
 * A count is logged on every run, including zero. A job that only speaks up
 * when it finds something is indistinguishable from a job that has silently
 * stopped running.
 *
 * Tunable through the environment:
 *   STORAGE_RECONCILIATION_GRACE_HOURS (default 24)
 *   STORAGE_RECONCILIATION_SWEEP_HOURS (default 24)
 *   STORAGE_RECONCILIATION_ENABLED     (set "false" to disable the timer)
 */
@Injectable()
export class StorageReconciliationService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(StorageReconciliationService.name)
  private startupTimer?: NodeJS.Timeout
  private sweepTimer?: NodeJS.Timeout
  /** One sweep at a time: a slow run must not overlap the next tick. */
  private running = false

  constructor(
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    if (this.config.get<string>('STORAGE_RECONCILIATION_ENABLED') === 'false') {
      this.logger.log('Storage reconciliation disabled by configuration.')
      return
    }
    const sweepHours = this.readPositiveNumber(
      'STORAGE_RECONCILIATION_SWEEP_HOURS',
      DEFAULT_SWEEP_HOURS,
    )

    this.startupTimer = setTimeout(() => {
      void this.safeSweep()
    }, STARTUP_DELAY_MS)
    this.startupTimer.unref?.()

    this.sweepTimer = setInterval(
      () => {
        void this.safeSweep()
      },
      sweepHours * MS_PER_HOUR,
    )
    this.sweepTimer.unref?.()

    this.logger.log(
      `Storage reconciliation active: report-only, ${this.graceHours()}h grace, sweeping every ${sweepHours}h.`,
    )
  }

  onModuleDestroy(): void {
    if (this.startupTimer) clearTimeout(this.startupTimer)
    if (this.sweepTimer) clearInterval(this.sweepTimer)
  }

  /** Background entry point: never throws, never overlaps. */
  private async safeSweep(): Promise<void> {
    if (this.running) {
      this.logger.warn('Skipping sweep: the previous one is still running.')
      return
    }
    try {
      await this.sweep()
    } catch (error) {
      this.logger.warn(
        `Storage reconciliation sweep failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  /**
   * Walks the bucket one page at a time and reports keys with no document row.
   *
   * Each page is compared to the database in a single batched lookup rather
   * than one query per key, so a bucket of n objects costs n/PAGE_SIZE queries
   * instead of n.
   */
  async sweep(): Promise<ReconciliationReport> {
    if (this.running)
      throw new Error('A reconciliation sweep is already running.')
    this.running = true
    const startedAt = new Date()

    try {
      const cutoff = new Date(
        startedAt.getTime() - this.graceHours() * MS_PER_HOUR,
      )
      let startAfter: string | undefined
      let examined = 0
      let withinGrace = 0
      let orphans = 0
      let orphanBytes = 0
      let pages = 0
      let truncated = false
      const sample: OrphanSample[] = []

      for (;;) {
        const page = await this.storage.listKeys({
          startAfter,
          limit: PAGE_SIZE,
        })
        if (page.objects.length === 0) break
        pages += 1

        // Grace first: young keys are never looked up in the database.
        const settled = page.objects.filter((object) => {
          const old = object.lastModified.getTime() <= cutoff.getTime()
          if (!old) withinGrace += 1
          return old
        })
        examined += settled.length

        if (settled.length > 0) {
          const known = await this.documents.findExistingStorageKeys(
            settled.map((object) => object.key),
          )
          for (const object of settled) {
            if (known.has(object.key)) continue
            orphans += 1
            orphanBytes += object.size
            if (sample.length < SAMPLE_LIMIT)
              sample.push({
                key: object.key,
                size: object.size,
                lastModified: object.lastModified.toISOString(),
              })
          }
        }

        if (!page.nextStartAfter) break
        startAfter = page.nextStartAfter
        if (pages >= MAX_PAGES) {
          truncated = true
          this.logger.warn(
            `Storage reconciliation stopped after ${MAX_PAGES} pages; the bucket is larger than one sweep handles.`,
          )
          break
        }
      }

      const finishedAt = new Date()
      // Logged unconditionally, zero included: silence would be ambiguous
      // between "nothing found" and "job no longer running".
      this.logger.log(
        [
          'storage reconciliation',
          'mode=report-only',
          `examined=${examined}`,
          `withinGrace=${withinGrace}`,
          `orphans=${orphans}`,
          `orphanBytes=${orphanBytes}`,
          `graceHours=${this.graceHours()}`,
          `truncated=${truncated}`,
          `durationMs=${finishedAt.getTime() - startedAt.getTime()}`,
          `at=${finishedAt.toISOString()}`,
        ].join(' '),
      )

      return {
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        examined,
        withinGrace,
        orphans,
        orphanBytes,
        sample,
        truncated,
      }
    } finally {
      this.running = false
    }
  }

  private graceHours(): number {
    return this.readPositiveNumber(
      'STORAGE_RECONCILIATION_GRACE_HOURS',
      DEFAULT_GRACE_HOURS,
    )
  }

  private readPositiveNumber(key: string, fallback: number): number {
    const raw = this.config.get<string>(key)
    const value = raw === undefined ? Number.NaN : Number(raw)
    return Number.isFinite(value) && value > 0 ? value : fallback
  }
}
