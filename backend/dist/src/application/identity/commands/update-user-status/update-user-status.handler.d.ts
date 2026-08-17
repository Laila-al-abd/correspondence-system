import { ICommandHandler } from '@nestjs/cqrs';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserStatus } from '../../../../domain/identity/enums';
import { AdministrativeFloorPolicy } from '../../policies/administrative-floor.policy';
import { UpdateUserStatusCommand } from './update-user-status.command';
export interface UpdateUserStatusResult {
    userId: string;
    status: UserStatus;
}
export declare class UpdateUserStatusHandler implements ICommandHandler<UpdateUserStatusCommand, UpdateUserStatusResult> {
    private readonly users;
    private readonly floor;
    constructor(users: UserRepository, floor: AdministrativeFloorPolicy);
    execute({ input, }: UpdateUserStatusCommand): Promise<UpdateUserStatusResult>;
    private parse;
}
