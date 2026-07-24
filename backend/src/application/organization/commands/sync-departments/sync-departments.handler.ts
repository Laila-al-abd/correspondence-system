import { ConfigService } from '@nestjs/config'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  SyncDepartmentsFromDirectory,
  SyncDepartmentsResult,
} from '../../sync-departments-from-directory'
import { SyncDepartmentsCommand } from './sync-departments.command'

const DEFAULT_SOURCE = 'personnel-directory'

/**
 * Runs the department sync against the configured personnel directory. The
 * source label (stored on each unit's external reference) defaults to the
 * PERSONNEL_DIRECTORY_SOURCE env var and can be overridden per request.
 */
@CommandHandler(SyncDepartmentsCommand)
export class SyncDepartmentsHandler
  implements ICommandHandler<SyncDepartmentsCommand, SyncDepartmentsResult>
{
  constructor(
    private readonly sync: SyncDepartmentsFromDirectory,
    private readonly config: ConfigService,
  ) {}

  execute({ source }: SyncDepartmentsCommand): Promise<SyncDepartmentsResult> {
    const resolved =
      source ??
      this.config.get<string>('PERSONNEL_DIRECTORY_SOURCE') ??
      DEFAULT_SOURCE
    return this.sync.execute(resolved)
  }
}
