import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaEventLogRepository } from '../../infrastructure/observability/prisma-event-log.repository'
import { PrismaNotificationRepository } from '../../infrastructure/observability/prisma-notification.repository'
import { PrismaNotificationAudience } from '../../infrastructure/observability/prisma-notification-audience'
import { InMemoryNotificationStream } from '../../infrastructure/observability/in-memory-notification-stream'
import { PrismaMlPredictionRepository } from '../../infrastructure/observability/prisma-ml-prediction.repository'
import { PrismaAcademicCalendarRepository } from '../../infrastructure/observability/prisma-academic-calendar.repository'
import { PrismaSystemSettingRepository } from '../../infrastructure/observability/prisma-system-setting.repository'
import { NotificationRetentionService } from '../../infrastructure/observability/notification-retention.service'
import { IncrementingIdGenerator } from '../../infrastructure/shared/incrementing-id.generator'
import { NotificationEmitter } from '../../application/observability/services/notification-emitter'
import { ListMyNotificationsHandler } from '../../application/observability/queries/list-my-notifications/list-my-notifications.handler'
import { CountUnreadNotificationsHandler } from '../../application/observability/queries/count-unread-notifications/count-unread-notifications.handler'
import { MarkNotificationReadHandler } from '../../application/observability/commands/mark-notification-read/mark-notification-read.handler'
import { MarkAllNotificationsReadHandler } from '../../application/observability/commands/mark-all-notifications-read/mark-all-notifications-read.handler'
import { PurgeOldNotificationsHandler } from '../../application/observability/commands/purge-old-notifications/purge-old-notifications.handler'
import {
  ACADEMIC_CALENDAR_REPOSITORY,
  EVENT_LOG_REPOSITORY,
  ID_GENERATOR,
  ML_PREDICTION_REPOSITORY,
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_REPOSITORY,
  NOTIFICATION_STREAM,
  SYSTEM_SETTING_REPOSITORY,
} from '../../application/tokens'
import { NotificationsController } from './notifications.controller'

const handlers = [
  ListMyNotificationsHandler,
  CountUnreadNotificationsHandler,
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
  PurgeOldNotificationsHandler,
]

/**
 * Observability composition root. Binds the audit-log, notification,
 * ML-prediction, academic-calendar, and system-setting ports to their Prisma
 * adapters and exports them so the Request and (future) AI contexts can record
 * events, notify users, store inferences, and read configuration through the
 * same ports.
 *
 * This module also owns the notification feature end to end: the inbox API, the
 * NotificationEmitter that other contexts call when something happens, and the
 * retention job that drops messages once they age out. NotificationEmitter is
 * exported so the Request and Identity modules can inject it.
 */
@Module({
  imports: [CqrsModule],
  controllers: [NotificationsController],
  providers: [
    ...handlers,
    NotificationEmitter,
    NotificationRetentionService,
    { provide: EVENT_LOG_REPOSITORY, useClass: PrismaEventLogRepository },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    { provide: NOTIFICATION_AUDIENCE, useClass: PrismaNotificationAudience },
    { provide: NOTIFICATION_STREAM, useClass: InMemoryNotificationStream },
    {
      provide: ML_PREDICTION_REPOSITORY,
      useClass: PrismaMlPredictionRepository,
    },
    {
      provide: ACADEMIC_CALENDAR_REPOSITORY,
      useClass: PrismaAcademicCalendarRepository,
    },
    {
      provide: SYSTEM_SETTING_REPOSITORY,
      useClass: PrismaSystemSettingRepository,
    },
    { provide: ID_GENERATOR, useClass: IncrementingIdGenerator },
  ],
  exports: [
    EVENT_LOG_REPOSITORY,
    NOTIFICATION_REPOSITORY,
    ML_PREDICTION_REPOSITORY,
    ACADEMIC_CALENDAR_REPOSITORY,
    SYSTEM_SETTING_REPOSITORY,
    NotificationEmitter,
  ],
})
export class ObservabilityModule {}
