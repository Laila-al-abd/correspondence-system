import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'node:crypto'

/**
 * How long a ticket stays redeemable. Long enough to cover the browser
 * creating an EventSource immediately after the fetch that obtained it, short
 * enough that a ticket captured from a log or a screen is dead before it can be
 * used.
 */
const TICKET_TTL_MS = 30_000

interface IssuedTicket {
  userId: string
  expiresAt: number
}

/**
 * Short-lived, single-use tickets that let a browser open the notification
 * stream without putting an access token in a URL.
 *
 * The problem this solves: EventSource cannot set an Authorization header. The
 * previous workaround accepted `?access_token=` on the stream route, which puts
 * a full-lifetime JWT -- one that opens every endpoint in the API -- into a
 * place that is copied everywhere. Query strings are written to nginx access
 * logs in plaintext, kept in browser history, and sent in the Referer header to
 * any third-party resource the page loads. A token that leaks that way is valid
 * until it expires, and nothing in the logs distinguishes its use from the real
 * user's.
 *
 * A ticket is a different kind of credential: it authorizes exactly one thing
 * (open my notification stream), it is valid for seconds rather than an hour,
 * and it can only be used once. If one leaks, an attacker gets a stream of one
 * user's notifications for at most thirty seconds -- and only if they beat the
 * legitimate browser to it, because redemption consumes it.
 *
 * It is deliberately not a JWT. A JWT would be self-validating, which is the
 * opposite of what is wanted: single use requires server-side state, so that
 * redeeming can *delete* something. Opaque random bytes with a server-side map
 * make single-use the mechanism rather than a claim to be checked.
 *
 * The store is in-memory, which matches the notification stream itself -- an
 * SSE connection is pinned to one process, so a ticket is only ever redeemed on
 * the instance that issued it. When the API is run on more than one node behind
 * a load balancer, both this map and InMemoryNotificationStream move to Redis
 * together, and for the same reason.
 */
@Injectable()
export class StreamTicketService {
  private readonly logger = new Logger(StreamTicketService.name)
  private readonly tickets = new Map<string, IssuedTicket>()

  /** Mints a ticket for the authenticated caller. */
  issue(userId: string): { ticket: string; expiresInSeconds: number } {
    this.sweepExpired()

    // 32 bytes from the CSPRNG. base64url because this travels in a query
    // string, where the standard alphabet's + and / would need escaping.
    const ticket = randomBytes(32).toString('base64url')
    this.tickets.set(ticket, {
      userId,
      expiresAt: Date.now() + TICKET_TTL_MS,
    })
    return { ticket, expiresInSeconds: TICKET_TTL_MS / 1000 }
  }

  /**
   * Consumes a ticket and returns whose stream it opens, or null.
   *
   * Note the order: the entry is deleted before it is judged. Validating first
   * and deleting after leaves a window in which two concurrent redemptions of
   * the same ticket both pass, which would make "single use" a description
   * rather than a guarantee. Deleting first means the loser of the race gets
   * nothing back to validate.
   */
  redeem(ticket: string): string | null {
    const issued = this.tickets.get(ticket)
    if (!issued) return null
    this.tickets.delete(ticket)

    if (issued.expiresAt <= Date.now()) return null
    return issued.userId
  }

  /**
   * Drops expired tickets on issuance rather than on a timer. Tickets are only
   * created when someone opens the inbox, so the map cannot grow without
   * someone triggering the sweep, and there is no interval keeping the process
   * awake with nothing to do.
   */
  private sweepExpired(): void {
    const now = Date.now()
    let removed = 0
    for (const [ticket, issued] of this.tickets)
      if (issued.expiresAt <= now) {
        this.tickets.delete(ticket)
        removed++
      }
    if (removed > 0)
      this.logger.debug(`Swept ${removed} expired stream ticket(s).`)
  }
}
