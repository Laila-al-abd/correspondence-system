import { ICommandHandler } from '@nestjs/cqrs';
import type { DelegationRepository } from '../../../../domain/identity/ports/delegation.repository';
import type { DelegationQueryPort, DelegationView } from '../../ports/delegation-query.port';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { RevokeDelegationCommand } from './revoke-delegation.command';
export declare class RevokeDelegationHandler implements ICommandHandler<RevokeDelegationCommand, DelegationView> {
    private readonly delegations;
    private readonly delegationView;
    private readonly notifier;
    constructor(delegations: DelegationRepository, delegationView: DelegationQueryPort, notifier: NotificationEmitter);
    execute({ delegationId, }: RevokeDelegationCommand): Promise<DelegationView>;
}
