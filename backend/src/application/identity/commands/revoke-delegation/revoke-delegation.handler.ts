import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { DelegationRepository } from '../../../../domain/identity/ports/delegation.repository'
import type {
  DelegationQueryPort,
  DelegationView,
} from '../../ports/delegation-query.port'
import { Identifier } from '../../../../domain/shared/identifier'
import { DELEGATION_QUERY, DELEGATION_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { RevokeDelegationCommand } from './revoke-delegation.command'

/**
 * Revokes a delegation (deactivates it; the row is kept for audit). 404s if the
 * delegation is unknown. Returns the delegation in its now-inactive state.
 */
@CommandHandler(RevokeDelegationCommand)
export class RevokeDelegationHandler
  implements ICommandHandler<RevokeDelegationCommand, DelegationView>
{
  constructor(
    @Inject(DELEGATION_REPOSITORY)
    private readonly delegations: DelegationRepository,
    @Inject(DELEGATION_QUERY)
    private readonly delegationView: DelegationQueryPort,
  ) {}

  async execute({
    delegationId,
  }: RevokeDelegationCommand): Promise<DelegationView> {
    const delegation = await this.delegations.findById(
      Identifier.of(delegationId),
    )
    if (!delegation) throw new EntityNotFoundError('Delegation', delegationId)

    delegation.revoke()
    await this.delegations.save(delegation)

    const view = await this.delegationView.getById(delegationId)
    if (!view) throw new EntityNotFoundError('Delegation', delegationId)
    return view
  }
}
