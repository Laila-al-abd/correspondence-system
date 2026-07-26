import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CommandBus } from '@nestjs/cqrs'
import { PurgeOldNotificationsCommand } from '../../application/observability/commands/purge-old-notifications/purge-old-notifications.command'
import { PurgeResult } from '../../application/observability/queries/views/notification.view'

const MS_PER_HOUR = 60 * 60 * 1000
const DEFAULT_RETENTION_DAYS = 30
const DEFAULT_SWEEP_HOURS = 24
/** Small delay so startup is not slowed by a database sweep. */
const STARTUP_DELAY_MS = 10_000

/**
 * Background retention job for notifications.
 *
 * Deliberately built on the Node timer API instead of @nestjs/schedule so the
 * feature adds no new dependency. The timers are unref'd, which means they
 * never keep the process alive on their own, and both are cleared on shutdown
 * so tests and graceful restarts stay clean.
 *
 * Tunable through the environment:
 *   NOTIFICATION_RETENTION_DAYS        (default 30)
 *   NOTIFICATION_RETENTION_SWEEP_HOURS (default 24)
 */
@Injectable()
export class NotificationRetentionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationRetentionService.name)
  private startupTimer?: NodeJS.Timeout
  private sweepTimer?: NodeJS.Timeout

  constructor(
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const sweepHours = this.readPositiveNumber(
      'NOTIFICATION_RETENTION_SWEEP_HOURS',
      DEFAULT_SWEEP_HOURS,
    )

    this.startupTimer = setTimeout(() => {
      void this.sweep()
    }, STARTUP_DELAY_MS)
    this.startupTimer.unref?.()

    this.sweepTimer = setInterval(
      () => {
        void this.sweep()
      },
      sweepHours * MS_PER_HOUR,
    )
    this.sweepTimer.unref?.()

    this.logger.log(
      `Notification retention active: keeping ${this.retentionDays()} days, sweeping every ${sweepHours}h.`,
    )
  }

  onModuleDestroy(): void {
    if (this.startupTimer) clearTimeout(this.startupTimer)
    if (this.sweepTimer) clearInterval(this.sweepTimer)
  }

  /** Runs one retention pass. Never throws -- a failed sweep is retried later. */
  async sweep(): Promise<void> {
    try {
      const result = (await this.commandBus.execute(
        new PurgeOldNotificationsCommand(this.retentionDays()),
      )) as PurgeResult
      if (result.deleted > 0)
        this.logger.log(
          `Removed ${result.deleted} notification(s) created before ${result.cutoff}.`,
        )
    } catch (error) {
      this.logger.warn(
        `Notification retention sweep failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  private retentionDays(): number {
    return this.readPositiveNumber(
      'NOTIFICATION_RETENTION_DAYS',
      DEFAULT_RETENTION_DAYS,
    )
  }

  private readPositiveNumber(key: string, fallback: number): number {
    const raw = this.config.get<string>(key)
    const value = raw === undefined ? Number.NaN : Number(raw)
    return Number.isFinite(value) && value > 0 ? value : fallback
  }
}
