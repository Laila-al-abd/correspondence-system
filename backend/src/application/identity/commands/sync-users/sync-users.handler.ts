import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  SyncUsersFromDirectory,
  SyncUsersResult,
} from '../../sync-users-from-directory'
import { SyncUsersCommand } from './sync-users.command'

/**
 * Default source label. Must match the one the department sync uses, because
 * a person's department is resolved by (externalId, sourceSystem) -- label the
 * two feeds differently and every department lookup silently misses.
 */
const DEFAULT_SOURCE = 'personnel-directory'

@CommandHandler(SyncUsersCommand)
export class SyncUsersHandler
  implements ICommandHandler<SyncUsersCommand, SyncUsersResult>
{
  constructor(private readonly sync: SyncUsersFromDirectory) {}

  execute(command: SyncUsersCommand): Promise<SyncUsersResult> {
    return this.sync.execute(command.source ?? DEFAULT_SOURCE)
  }
}
