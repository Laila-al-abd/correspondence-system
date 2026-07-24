import { Module } from '@nestjs/common'
import { PrismaEventLogRepository } from '../../infrastructure/observability/prisma-event-log.repository'
import { PrismaNotificationRepository } from '../../infrastructure/observability/prisma-notification.repository'
import { PrismaMlPredictionRepository } from '../../infrastructure/observability/prisma-ml-prediction.repository'
import { PrismaAcademicCalendarRepository } from '../../infrastructure/observability/prisma-academic-calendar.repository'
import { PrismaSystemSettingRepository } from '../../infrastructure/observability/prisma-system-setting.repository'
import {
  EVENT_LOG_REPOSITORY,
  NOTIFICATION_REPOSITORY,
  ML_PREDICTION_REPOSITORY,
  ACADEMIC_CALENDAR_REPOSITORY,
  SYSTEM_SETTING_REPOSITORY,
} from '../../application/tokens'

/**
 * Observability composition root. Binds the audit-log, notification,
 * ML-prediction, academic-calendar, and system-setting ports to their Prisma
 * adapters and exports them so the Request and (future) AI contexts can record
 * events, notify users, store inferences, and read configuration through the
 * same ports.
 */
@Module({
  providers: [
    { provide: EVENT_LOG_REPOSITORY, useClass: PrismaEventLogRepository },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
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
  ],
  exports: [
    EVENT_LOG_REPOSITORY,
    NOTIFICATION_REPOSITORY,
    ML_PREDICTION_REPOSITORY,
    ACADEMIC_CALENDAR_REPOSITORY,
    SYSTEM_SETTING_REPOSITORY,
  ],
})
export class ObservabilityModule {}
