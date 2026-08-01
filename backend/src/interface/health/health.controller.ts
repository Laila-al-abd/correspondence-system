import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import {
  DependencyHealthService,
  HealthReport,
} from '../../infrastructure/observability/dependency-health.service'
import { RequirePermissions } from '../identity/permissions.decorator'
import { Public } from '../identity/public.decorator'

/**
 * Two health endpoints, because "is it healthy?" has two different audiences
 * and they must not be served the same answer.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly probes: DependencyHealthService) {}

  /**
   * Liveness. Public, and deliberately says almost nothing.
   *
   * The callers here are Docker's HEALTHCHECK, nginx's upstream check, and
   * whatever uptime monitor the university runs. None of them can present a
   * JWT, so this route cannot be authenticated without making it useless. What
   * it can do is refuse to leak: a 200 and the word "ok" tells an anonymous
   * caller that a process is answering HTTP and nothing else. It does not name
   * the database, the object store, their versions, or their error messages.
   *
   * It is exempt from rate limiting because a monitor polling every few seconds
   * is the entire point of the endpoint, and throttling it would manufacture
   * outages that are not real.
   */
  @Public()
  @SkipThrottle()
  @Get()
  liveness(): { status: 'ok' } {
    return { status: 'ok' }
  }

  /**
   * Readiness, with per-dependency detail. Authenticated and permission-gated.
   *
   * Everything the liveness probe withholds is here: which dependencies exist,
   * whether each one is answering, how slowly, and the error text when it is
   * not. That is operational intelligence -- it tells a reader which database
   * and object store this system runs on, and, more usefully to an attacker,
   * the moment either of them goes down. So it sits behind `system.monitor`.
   *
   * A new permission rather than reuse of `user.manage`: inspecting
   * infrastructure and administering people are different duties, and the whole
   * point of a permission model is that they can be handed to different people.
   * An operations engineer who watches dependencies should not thereby be able
   * to grant themselves roles.
   *
   * Answers 503 when any dependency is down. The status code is the contract --
   * an orchestrator reads it and pulls the instance out of rotation, and a 200
   * carrying `"status": "degraded"` in the body would be silently ignored by
   * every tool that consumes this.
   */
  @Get('detailed')
  @RequirePermissions('system.monitor')
  async detailed(): Promise<HealthReport> {
    const report = await this.probes.check()
    if (report.status !== 'ok')
      throw new HttpException(report, HttpStatus.SERVICE_UNAVAILABLE)
    return report
  }
}
