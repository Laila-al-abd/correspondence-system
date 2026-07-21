import { Injectable } from '@nestjs/common'
import { IdGenerator } from '../../domain/shared/id-generator'
import { Identifier } from '../../domain/shared/identifier'

/**
 * Simple in-process id generator for BIGINT keys. Seeded from the current epoch
 * so ids are unique across restarts during development. Replace with a DB
 * sequence or snowflake generator for production if strict ordering is needed.
 */
@Injectable()
export class IncrementingIdGenerator implements IdGenerator {
  private current = BigInt(Date.now())

  next(): Identifier {
    this.current += 1n
    return Identifier.of(this.current)
  }
}
