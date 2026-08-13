import { ICommandHandler } from '@nestjs/cqrs';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import type { DelegationRepository } from '../../../../domain/identity/ports/delegation.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { DelegationQueryPort, DelegationView } from '../../ports/delegation-query.port';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { GrantDelegationCommand } from './grant-delegation.command';
export declare class GrantDelegationHandler implements ICommandHandler<GrantDelegationCommand, DelegationView> {
    private readonly users;
    private readonly delegations;
    private readonly delegationView;
    private readonly ids;
    private readonly notifier;
    constructor(users: UserRepository, delegations: DelegationRepository, delegationView: DelegationQueryPort, ids: IdGenerator, notifier: NotificationEmitter);
    execute({ input }: GrantDelegationCommand): Promise<DelegationView>;
}
