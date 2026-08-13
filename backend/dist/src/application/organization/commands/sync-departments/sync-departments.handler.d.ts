import { ConfigService } from '@nestjs/config';
import { ICommandHandler } from '@nestjs/cqrs';
import { SyncDepartmentsFromDirectory, SyncDepartmentsResult } from '../../sync-departments-from-directory';
import { SyncDepartmentsCommand } from './sync-departments.command';
export declare class SyncDepartmentsHandler implements ICommandHandler<SyncDepartmentsCommand, SyncDepartmentsResult> {
    private readonly sync;
    private readonly config;
    constructor(sync: SyncDepartmentsFromDirectory, config: ConfigService);
    execute({ source }: SyncDepartmentsCommand): Promise<SyncDepartmentsResult>;
}
