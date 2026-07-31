import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Sse,
  UnauthorizedException,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Observable, interval, map, merge } from 'rxjs'
import type { AccessTokenService } from '../../domain/identity/ports/access-token.service'
import {
  ACCESS_TOKEN_SERVICE,
  NOTIFICATION_STREAM,
} from '../../application/tokens'
import type { NotificationStreamPort } from '../../application/observability/ports/notification-stream.port'
import { CurrentUserId } from '../identity/current-user.decorator'
import { RequirePermissions } from '../identity/permissions.decorator'
import { Public } from '../identity/public.decorator'
import { ListMyNotificationsQuery } from '../../application/observability/queries/list-my-notifications/list-my-notifications.query'
import { CountUnreadNotificationsQuery } from '../../application/observability/queries/count-unread-notifications/count-unread-notifications.query'
import { MarkNotificationReadCommand } from '../../application/observability/commands/mark-notification-read/mark-notification-read.command'
import { MarkAllNotificationsReadCommand } from '../../application/observability/commands/mark-all-notifications-read/mark-all-notifications-read.command'
import { PurgeOldNotificationsCommand } from '../../application/observability/commands/purge-old-notifications/purge-old-notifications.command'
import type {
  MarkReadResult,
  NotificationView,
  PurgeResult,
  UnreadCountView,
} from '../../application/observability/queries/views/notification.view'
import { ListNotificationsDto } from './dto/list-notifications.dto'
import { PurgeNotificationsDto } from './dto/purge-notifications.dto'

const DEFAULT_RETENTION_DAYS = 30

/**
 * How often to send a comment line down an idle stream. Proxies and load
 * balancers close connections that look dead, and the browser cannot tell that
 * apart from a real drop, so a periodic beat keeps the pipe demonstrably alive.
 */
const HEARTBEAT_MS = 30_000

/** The Server-Sent Events frame shape: `type` becomes the event name. */
interface SseMessage {
  type: string
  data: string | object
}

/** Only the parts of the HTTP request the stream endpoint needs. */
interface StreamRequest {
  headers?: Record<string, string | string[] | undefined>
  query?: Record<string, unknown>
}

/**
 * The user's notification inbox.
 *
 * Every read and write is scoped to the authenticated caller through
 * CurrentUserId -- there is no route that can list or modify another user's
 * notifications, so no extra permission is needed for the personal endpoints.
 * Only the manual retention sweep is an admin action.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(NOTIFICATION_STREAM)
    private readonly streamPort: NotificationStreamPort,
    @Inject(ACCESS_TOKEN_SERVICE)
    private readonly tokens: AccessTokenService,
  ) {}

  // ----- reads (literal paths first so they win the route match) -----

  @Get()
  list(
    @CurrentUserId() userId: string,
    @Query() dto: ListNotificationsDto,
  ): Promise<NotificationView[]> {
    return this.queryBus.execute(
      new ListMyNotificationsQuery(userId, dto.unreadOnly === 'true'),
    )
  }

  @Get('unread-count')
  countUnread(@CurrentUserId() userId: string): Promise<UnreadCountView> {
    return this.queryBus.execute(new CountUnreadNotificationsQuery(userId))
  }

  /**
   * Live notifications over Server-Sent Events: the browser opens one long-lived
   * GET and the server writes each new notification as it happens, so the inbox
   * updates without polling.
   *
   * SSE is used rather than WebSockets because the traffic here is entirely
   * one-way -- the client never sends anything up this pipe. That means no extra
   * dependency, no second protocol to secure or proxy, plain HTTP all the way
   * through, and automatic reconnection built into the browser's EventSource.
   *
   * Authentication is done by hand, and the route is marked @Public() only so
   * that the global JwtAuthGuard steps aside -- it is emphatically not open.
   * EventSource cannot set an Authorization header, so the token may also arrive
   * as `?access_token=`. Confining that to this one route, verified with the
   * same AccessTokenService as everything else, keeps a query-string token from
   * becoming a way in anywhere else in the API.
   */
  @Sse('stream')
  @Public()
  stream(@Req() request: StreamRequest): Observable<SseMessage> {
    const userId = this.authenticate(request)

    const notifications = this.notificationEvents(userId)
    const heartbeat = interval(HEARTBEAT_MS).pipe(
      map(
        (): SseMessage => ({
          type: 'ping',
          data: { at: new Date().toISOString() },
        }),
      ),
    )

    // The observable never completes on its own; it ends when the client
    // disconnects, at which point Nest unsubscribes and the heartbeat stops.
    return merge(notifications, heartbeat)
  }

  // ----- writes -----

  @Post('read-all')
  markAllRead(@CurrentUserId() userId: string): Promise<MarkReadResult> {
    return this.commandBus.execute(
      new MarkAllNotificationsReadCommand(userId),
    )
  }

  /**
   * Runs the retention sweep immediately. The nightly job does the same thing;
   * this exists so the policy can be demonstrated and audited on demand.
   */
  @Post('purge')
  @RequirePermissions('user.manage')
  purge(@Body() dto: PurgeNotificationsDto): Promise<PurgeResult> {
    return this.commandBus.execute(
      new PurgeOldNotificationsCommand(
        dto.retentionDays ?? DEFAULT_RETENTION_DAYS,
      ),
    )
  }

  @Post(':id/read')
  markRead(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<NotificationView> {
    return this.commandBus.execute(
      new MarkNotificationReadCommand(id, userId),
    )
  }

  // ----- stream helpers -----
// ----- stream helpers -----

private notificationEvents(userId: string): Observable<SseMessage> {
  return this.streamPort
    .streamFor(userId)
    .pipe(map((event): SseMessage => ({ type: 'notification', data: event })))
}

  /**
   * Resolves the caller from the Authorization header when present, falling
   * back to the `access_token` query parameter for browser EventSource clients.
   */
  private authenticate(request: StreamRequest): string {
    const header = request.headers?.['authorization']
    const bearer =
      typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice('Bearer '.length).trim()
        : undefined

    const queryToken = request.query?.['access_token']
    const fromQuery =
      typeof queryToken === 'string' && queryToken.length > 0
        ? queryToken.trim()
        : undefined

    const token = bearer ?? fromQuery
    if (!token)
      throw new UnauthorizedException(
        'Provide the access token in the Authorization header or as ?access_token=.',
      )

    try {
      return this.tokens.verify(token).userId
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.')
    }
  }
}
