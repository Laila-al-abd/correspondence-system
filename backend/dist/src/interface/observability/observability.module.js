"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_event_log_repository_1 = require("../../infrastructure/observability/prisma-event-log.repository");
const prisma_notification_repository_1 = require("../../infrastructure/observability/prisma-notification.repository");
const prisma_notification_audience_1 = require("../../infrastructure/observability/prisma-notification-audience");
const in_memory_notification_stream_1 = require("../../infrastructure/observability/in-memory-notification-stream");
const prisma_ml_prediction_repository_1 = require("../../infrastructure/observability/prisma-ml-prediction.repository");
const prisma_academic_calendar_repository_1 = require("../../infrastructure/observability/prisma-academic-calendar.repository");
const prisma_system_setting_repository_1 = require("../../infrastructure/observability/prisma-system-setting.repository");
const notification_retention_service_1 = require("../../infrastructure/observability/notification-retention.service");
const stream_ticket_service_1 = require("../../infrastructure/observability/stream-ticket.service");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const als_client_context_1 = require("../../infrastructure/shared/als-client-context");
const notification_emitter_1 = require("../../application/observability/services/notification-emitter");
const event_recorder_1 = require("../../application/observability/services/event-recorder");
const business_hours_service_1 = require("../../application/observability/services/business-hours.service");
const list_my_notifications_handler_1 = require("../../application/observability/queries/list-my-notifications/list-my-notifications.handler");
const count_unread_notifications_handler_1 = require("../../application/observability/queries/count-unread-notifications/count-unread-notifications.handler");
const mark_notification_read_handler_1 = require("../../application/observability/commands/mark-notification-read/mark-notification-read.handler");
const mark_all_notifications_read_handler_1 = require("../../application/observability/commands/mark-all-notifications-read/mark-all-notifications-read.handler");
const purge_old_notifications_handler_1 = require("../../application/observability/commands/purge-old-notifications/purge-old-notifications.handler");
const get_setting_handler_1 = require("../../application/observability/queries/get-setting/get-setting.handler");
const update_setting_handler_1 = require("../../application/observability/commands/update-setting/update-setting.handler");
const tokens_1 = require("../../application/tokens");
const notifications_controller_1 = require("./notifications.controller");
const settings_controller_1 = require("./settings.controller");
const handlers = [
    list_my_notifications_handler_1.ListMyNotificationsHandler,
    count_unread_notifications_handler_1.CountUnreadNotificationsHandler,
    mark_notification_read_handler_1.MarkNotificationReadHandler,
    mark_all_notifications_read_handler_1.MarkAllNotificationsReadHandler,
    purge_old_notifications_handler_1.PurgeOldNotificationsHandler,
    get_setting_handler_1.GetSettingHandler,
    update_setting_handler_1.UpdateSettingHandler,
];
let ObservabilityModule = class ObservabilityModule {
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [notifications_controller_1.NotificationsController, settings_controller_1.SettingsController],
        providers: [
            ...handlers,
            notification_emitter_1.NotificationEmitter,
            event_recorder_1.EventRecorder,
            business_hours_service_1.BusinessHoursService,
            notification_retention_service_1.NotificationRetentionService,
            stream_ticket_service_1.StreamTicketService,
            { provide: tokens_1.EVENT_LOG_REPOSITORY, useClass: prisma_event_log_repository_1.PrismaEventLogRepository },
            { provide: tokens_1.CLIENT_CONTEXT, useClass: als_client_context_1.AlsClientContext },
            {
                provide: tokens_1.NOTIFICATION_REPOSITORY,
                useClass: prisma_notification_repository_1.PrismaNotificationRepository,
            },
            { provide: tokens_1.NOTIFICATION_AUDIENCE, useClass: prisma_notification_audience_1.PrismaNotificationAudience },
            { provide: tokens_1.NOTIFICATION_STREAM, useClass: in_memory_notification_stream_1.InMemoryNotificationStream },
            {
                provide: tokens_1.ML_PREDICTION_REPOSITORY,
                useClass: prisma_ml_prediction_repository_1.PrismaMlPredictionRepository,
            },
            {
                provide: tokens_1.ACADEMIC_CALENDAR_REPOSITORY,
                useClass: prisma_academic_calendar_repository_1.PrismaAcademicCalendarRepository,
            },
            {
                provide: tokens_1.SYSTEM_SETTING_REPOSITORY,
                useClass: prisma_system_setting_repository_1.PrismaSystemSettingRepository,
            },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
        ],
        exports: [
            tokens_1.EVENT_LOG_REPOSITORY,
            tokens_1.NOTIFICATION_REPOSITORY,
            tokens_1.ML_PREDICTION_REPOSITORY,
            tokens_1.ACADEMIC_CALENDAR_REPOSITORY,
            tokens_1.SYSTEM_SETTING_REPOSITORY,
            notification_emitter_1.NotificationEmitter,
            event_recorder_1.EventRecorder,
            business_hours_service_1.BusinessHoursService,
        ],
    })
], ObservabilityModule);
//# sourceMappingURL=observability.module.js.map