import { Injectable } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { IdGenerator } from '../../domain/shared/id-generator'
import { Identifier } from '../../domain/shared/identifier'

/**
 * UUIDv7 identifier generator.
 *
 * v7 puts a 48-bit millisecond timestamp in the leading bits, so generated
 * ids sort in creation order. That keeps B-tree index inserts local (unlike
 * v4, which scatters writes across the whole index) while still being unique
 * without any coordination between processes — no sequence round-trip and no
 * worker id to configure per deployment.
 */
@Injectable()
export class UuidV7IdGenerator implements IdGenerator {
  next(): Identifier {
    return Identifier.of(uuidv7())
  }
}
