import { Injectable } from '@nestjs/common'
import { ReferenceNumberGenerator } from '../../domain/request/ports/reference-number-generator'
import {
  NumberingScheme,
  NumberingSchemeConfig,
} from '../../domain/request/value-objects/numbering-scheme'
import { PrismaService } from '../persistence/prisma.service'

const SETTING_KEY = 'request_numbering'

/**
 * Database-backed reference-number generator.
 *
 * It reads the institution's numbering rules from the `request_numbering`
 * system setting (falling back to defaults), then atomically reserves the next
 * value from a per-scope counter. The counter is bumped with a single
 * INSERT ... ON CONFLICT DO UPDATE ... RETURNING statement, so concurrent
 * submissions each receive a distinct number without any application-level
 * locking -- the row lock Postgres takes on conflict serializes them.
 */
@Injectable()
export class PrismaReferenceNumberGenerator
  implements ReferenceNumberGenerator
{
  constructor(private readonly prisma: PrismaService) {}

  async next(at: Date = new Date()): Promise<string> {
    const scheme = await this.loadScheme()
    const scope = scheme.scopeFor(at)
    const sequence = await this.reserve(scope)
    return scheme.format(sequence, at)
  }

  private async loadScheme(): Promise<NumberingScheme> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    })
    const config = (setting?.value ?? {}) as unknown as NumberingSchemeConfig
    return NumberingScheme.create(config)
  }

  private async reserve(scope: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ current_value: bigint }[]>`
      INSERT INTO request_number_sequences (scope, current_value, updated_at)
      VALUES (${scope}, 1, now())
      ON CONFLICT (scope) DO UPDATE
        SET current_value = request_number_sequences.current_value + 1,
            updated_at = now()
      RETURNING current_value
    `
    return Number(rows[0].current_value)
  }
}
