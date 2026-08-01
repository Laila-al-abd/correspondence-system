import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

/** One minute, the window every limit in this system is expressed against. */
const WINDOW_MS = 60_000

/**
 * The default ceiling: 100 requests a minute from one address.
 *
 * Chosen to be invisible to a person and obvious to a script. A reviewer
 * working quickly through a queue -- open a request, read it, act, next --
 * generates a few requests every several seconds, an order of magnitude below
 * this. Anything sustaining 100 a minute is automated, and the question is only
 * whether it is a runaway frontend loop or someone enumerating.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: WINDOW_MS, limit: 100 },
    ]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
