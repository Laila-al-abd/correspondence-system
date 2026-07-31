import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SlaMonitorService } from '../../application/observability/services/sla-monitor.service'
import { RequestContextStore } from '../shared/request-context'
import { SYSTEM_USER_ID } from '../shared/system-actor'

const MS_PER_MINUTE = 60 * 1000
const DEFAULT_SWEEP_MINUTES = 15
/** Small delay so startup is never slowed down by a database sweep. */
const STARTUP_DELAY_MS = 15_000

/**
 * Runs the SLA monitor on a timer.
 *
 * Built on Node timers rather than @nestjs/schedule, matching the notification
 * retention job, so the feature adds no new dependency. Both timers are
 * unref'd (they never keep the process alive on their own) and both are
 * cleared on shutdown, so restarts stay clean.
 *
 * The sweep runs inside a request context owned by the SYSTEM account.
 * Without it the audit stamping would record these writes with an empty actor,
 * and the audit trail could not tell "nobody touched this" apart from "a
 * background job touched this". The context must wrap the awaited work, not
 * just the call that starts it, or it has already unwound by the time the
 * repository runs.
 *
 * Tunable through the environment: SLA_SWEEP_MINUTES (default 15).
 */
@Injectable()
export class SlaMonitorScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SlaMonitorScheduler.name)
  private startupTimer?: NodeJS.Timeout
  private sweepTimer?: NodeJS.Timeout
  /** Guards against a slow sweep overlapping the next tick. */
  private running = false

  constructor(
    private readonly monitor: SlaMonitorService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const sweepMinutes = this.sweepMinutes()

    this.startupTimer = setTimeout(() => {
      void this.sweep()
    }, STARTUP_DELAY_MS)
    this.startupTimer.unref?.()

    this.sweepTimer = setInterval(
      () => {
        void this.sweep()
      },
      sweepMinutes * MS_PER_MINUTE,
    )
    this.sweepTimer.unref?.()

    this.logger.log(`SLA monitor active: sweeping every ${sweepMinutes}m.`)
  }

  onModuleDestroy(): void {
    if (this.startupTimer) clearTimeout(this.startupTimer)
    if (this.sweepTimer) clearInterval(this.sweepTimer)
  }

  /** Runs one pass. Never throws -- a failed sweep is simply retried later. */
  async sweep(): Promise<void> {
    if (this.running) {
      this.logger.warn(
        'Skipping this SLA sweep: the previous one is still running.',
      )
      return
    }
    this.running = true
    try {
      await RequestContextStore.run({ userId: SYSTEM_USER_ID }, async () => {
        const result = await this.monitor.sweep()
        if (result.requestsChanged > 0)
          this.logger.log(
            `SLA sweep: ${result.scannedSteps} open step(s) checked, ` +
              `${result.requestsChanged} request(s) updated ` +
              `(${result.breached} breached, ${result.atRisk} at risk, ${result.onTrack} on track).`,
          )
      })
    } catch (error) {
      this.logger.warn(
        `SLA sweep failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      this.running = false
    }
  }

  private sweepMinutes(): number {
    const raw = this.config.get<string>('SLA_SWEEP_MINUTES')
    const value = raw === undefined ? Number.NaN : Number(raw)
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_SWEEP_MINUTES
  }
}
