import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import {
  BusinessHoursService,
  describeDays,
} from '../../application/observability/services/business-hours.service'
import { PERMISSIONS_KEY } from './permissions.decorator'

/**
 * Permissions whose use is limited to working hours.
 *
 * Only powers that *act on other people's work* are here. Two deliberate
 * omissions:
 *
 * - `user.manage` -- an administrator must be able to fix configuration at any
 *   hour, including the working-hours policy itself. Restricting it could lock
 *   the whole system's settings away until the next working morning.
 * - `request.read` -- looking at a request harms nothing. Only state changes are
 *   time-boxed.
 */
const TIME_RESTRICTED_PERMISSIONS = new Set([
  'request.act',
  'workflow.manage',
  'template.manage',
  'reports.view',
])

/** Only the parts of the request this guard inspects or reports on. */
interface GuardedRequest {
  ip?: string
  socket?: { remoteAddress?: string }
  method?: string
  originalUrl?: string
  url?: string
  /** Set by JwtAuthGuard, which always runs before this guard. */
  user?: { userId?: string }
}

/**
 * Confines staff privileges to the university's working hours, and optionally
 * to its own network.
 *
 * The rule is attached to **permissions, not URLs**: any route that declares a
 * staff permission is covered, and personal routes -- logging in, submitting
 * your own request, reading your own notifications -- are not. So an employee
 * can file a request from home at midnight but cannot approve someone else's,
 * and the rule keeps applying automatically to endpoints added later.
 *
 * Both checks run on the server. Hiding pages in the frontend is presentation,
 * not security: anyone can call the API directly.
 *
 * Every decision this guard refuses is written to the security log stream in
 * one consistent, greppable shape -- rule, user, address, route, time -- so
 * denials can be counted per address and alerted on. Waived checks are logged
 * too: an auditor should be able to see exactly when a control was not being
 * enforced.
 *
 * These lines deliberately do *not* go to EventLog. That table holds business
 * facts about requests, and a denial concerns no request. Storing them there
 * would also let unauthenticated traffic drive database writes, turning a
 * logging feature into a denial-of-service amplifier: refused calls are the
 * cheapest thing to send and would be the most expensive thing to record.
 *
 * On failure modes the two checks differ on purpose. Working hours depend on
 * the database, and a database hiccup must not lock every employee out of their
 * job, so that check fails **open** and logs. The network allow-list needs no
 * I/O and is a security boundary, so it always fails **closed**.
 */
@Injectable()
export class WorkingHoursGuard implements CanActivate {
  private readonly logger = new Logger(WorkingHoursGuard.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly businessHours: BusinessHoursService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )
    // No declared permission means a personal route: never restricted.
    if (!required || required.length === 0) return true

    const request = context.switchToHttp().getRequest<GuardedRequest>()
    this.assertAllowedNetwork(request)

    const timeBoxed = required.some((code) =>
      TIME_RESTRICTED_PERMISSIONS.has(code),
    )
    if (!timeBoxed) return true

    await this.assertWorkingHours(request)
    return true
  }

  /**
   * Staff routes may be limited to the campus network. Configure
   * STAFF_IP_ALLOWLIST as a comma-separated list of addresses or prefixes,
   * e.g. "10.,192.168.,127.0.0.1". Unset means no network restriction, which
   * keeps local development and this project's test walkthrough working.
   *
   * Prefix matching is used rather than CIDR maths because it is easy to read
   * in configuration and impossible to get subtly wrong.
   */
  private assertAllowedNetwork(request: GuardedRequest): void {
    const allowed = (this.config.get<string>('STAFF_IP_ALLOWLIST') ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
    if (allowed.length === 0) return

    const client = normalizeIp(request.ip ?? request.socket?.remoteAddress)
    if (!client) {
      this.logger.warn(securityLine(request, 'network_allowlist'))
      throw new ForbiddenException(
        'Staff actions are restricted to the university network.',
      )
    }

    // Loopback is always allowed so the server can call itself.
    if (client === '127.0.0.1' || client === '::1') return

    const permitted = allowed.some((entry) => client.startsWith(entry))
    if (!permitted) {
      this.logger.warn(securityLine(request, 'network_allowlist'))
      throw new ForbiddenException(
        'Staff actions are only available from the university network.',
      )
    }
  }

  private async assertWorkingHours(request: GuardedRequest): Promise<void> {
    let open: boolean
    try {
      open = await this.businessHours.isWorkingMoment(new Date())
    } catch (error) {
      // Fail open: never let an infrastructure problem stop the university.
      // Logged as an allowed decision, because a period where this control was
      // silently not enforced is exactly what an auditor needs to find.
      const detail = error instanceof Error ? error.message : String(error)
      this.logger.warn(
        `${securityLine(request, 'working_hours', 'allowed')} ` +
          `reason=policy_unavailable detail="${detail}"`,
      )
      return
    }
    if (open) return

    this.logger.warn(securityLine(request, 'working_hours'))
    throw new ForbiddenException(await this.closedMessage())
  }

  /** Explains when the caller may try again, degrading gracefully. */
  private async closedMessage(): Promise<string> {
    try {
      const policy = await this.businessHours.policy()
      const reopens = await this.businessHours.nextWorkingMoment(new Date())
      return (
        `Staff actions are only available during working hours: ` +
        `${describeDays(policy.days)}, ${policy.start}-${policy.end} ` +
        `(${policy.timezone}). Next available at ${reopens.toISOString()}.`
      )
    } catch {
      return 'Staff actions are only available during working hours.'
    }
  }
}

/**
 * One line per access decision, as `key=value` pairs.
 *
 * The format is chosen to be searchable without a parser: counting denials from
 * one address is a single grep, and a log collector can split it on spaces. It
 * carries who (`userId`), from where (`ip`), what they tried (`route`), which
 * rule decided (`rule`), and when -- everything an incident review needs, and
 * nothing that identifies a person beyond their id.
 */
function securityLine(
  request: GuardedRequest,
  rule: 'working_hours' | 'network_allowlist',
  outcome: 'denied' | 'allowed' = 'denied',
): string {
  const client = normalizeIp(request.ip ?? request.socket?.remoteAddress)
  const route = `${request.method ?? '?'} ${
    request.originalUrl ?? request.url ?? '?'
  }`
  return [
    `access ${outcome}`,
    `rule=${rule}`,
    `userId=${request.user?.userId ?? 'anonymous'}`,
    `ip=${client ?? 'unknown'}`,
    `route="${route}"`,
    `at=${new Date().toISOString()}`,
  ].join(' ')
}

/** Strips the IPv6 form of an IPv4 address, e.g. "::ffff:10.0.0.5". */
function normalizeIp(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.startsWith('::ffff:') ? value.slice('::ffff:'.length) : value
}
