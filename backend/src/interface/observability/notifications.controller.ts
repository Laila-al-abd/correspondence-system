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
import { SkipThrottle } from '@nestjs/throttler'
import { Observable, interval, map, merge } from 'rxjs'
import { NOTIFICATION_STREAM } from '../../application/tokens'
import { StreamTicketService } from '../../infrastructure/observability/stream-ticket.service'
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
import { OffsetPage } from '../../application/shared/pagination'
import { toNumber } from '../shared/dto/page-query.dto'
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
    private readonly tickets: StreamTicketService,
  ) {}

  // ----- reads (literal paths first so they win the route match) -----

  /**
   * Paged by offset rather than cursor. An inbox is read from the top and the
   * unread count beside it is a number people expect to match, so a total is
   * worth having; and unlike the request queue, a notification arriving while
   * someone reads page two costs nothing if it is seen a moment later.
   */
  @Get()
  list(
    @CurrentUserId() userId: string,
    @Query() dto: ListNotificationsDto,
  ): Promise<OffsetPage<NotificationView>> {
    return this.queryBus.execute(
      new ListMyNotificationsQuery(
        userId,
        dto.unreadOnly === 'true',
        toNumber(dto.limit),
        toNumber(dto.offset),
      ),
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
   * EventSource cannot set an Authorization header, so the caller first asks
   * POST /notifications/stream-ticket for a single-use ticket (with a normal
   * Bearer token) and presents it here as `?ticket=`. What travels in the URL is
   * therefore a credential that expires in thirty seconds, is consumed on use,
   * and opens nothing but this one stream -- not an access token that opens the
   * whole API and lives in nginx logs and browser history for an hour.
   *
   * Exempt from rate limiting: this is one long-lived connection per session,
   * and the browser reconnects automatically after a drop. Counting a
   * reconnection storm after a deploy as abuse would keep the inbox dark
   * precisely when people are watching it.
   */
  @Sse('stream')
  @Public()
  @SkipThrottle()
  stream(@Req() request: StreamRequest): Observable<SseMessage> {
    const userId = this.authenticateByTicket(request)

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

  /**
   * Mints a single-use ticket for opening the notification stream.
   *
   * Authenticated the ordinary way, by the global JwtAuthGuard reading the
   * Authorization header, which is the whole point: the strong credential is
   * exchanged over a normal request for a weak, short-lived one that is safe to
   * put in a URL.
   */
  @Post('stream-ticket')
  streamTicket(
    @CurrentUserId() userId: string,
  ): { ticket: string; expiresInSeconds: number } {
    return this.tickets.issue(userId)
  }

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
   * Resolves the caller from a single-use stream ticket.
   *
   * Only tickets are accepted -- there is no Authorization-header path and no
   * access_token fallback. Leaving either in place would defeat the change: the
   * insecure route would stay reachable, and any client still using it would
   * keep working, so nothing would ever migrate off it.
   *
   * The failure message says how to obtain a ticket rather than merely refusing,
   * because the caller here is a browser that cannot set headers and the correct
   * next step is genuinely not obvious.
   */
  private authenticateByTicket(request: StreamRequest): string {
    const raw = request.query?.['ticket']
    const ticket = typeof raw === 'string' ? raw.trim() : ''
    if (ticket.length === 0)
      throw new UnauthorizedException(
        'Provide a stream ticket as ?ticket=. Obtain one from POST /notifications/stream-ticket.',
      )

    const userId = this.tickets.redeem(ticket)
    if (!userId)
      throw new UnauthorizedException(
        'That stream ticket is expired or has already been used. Request a new one.',
      )

    return userId
  }
}
