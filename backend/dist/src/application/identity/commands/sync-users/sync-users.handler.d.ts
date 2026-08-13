import { ICommandHandler } from '@nestjs/cqrs';
import { SyncUsersFromDirectory, SyncUsersResult } from '../../sync-users-from-directory';
import { SyncUsersCommand } from './sync-users.command';
export declare class SyncUsersHandler implements ICommandHandler<SyncUsersCommand, SyncUsersResult> {
    private readonly sync;
    constructor(sync: SyncUsersFromDirectory);
    execute(command: SyncUsersCommand): Promise<SyncUsersResult>;
}
