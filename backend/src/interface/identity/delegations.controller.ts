import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { GrantDelegationCommand } from '../../application/identity/commands/grant-delegation/grant-delegation.command'
import { RevokeDelegationCommand } from '../../application/identity/commands/revoke-delegation/revoke-delegation.command'
import { ListDelegationsQuery } from '../../application/identity/queries/list-delegations/list-delegations.query'
import { GetDelegationQuery } from '../../application/identity/queries/get-delegation/get-delegation.query'
import type { DelegationView } from '../../application/identity/ports/delegation-query.port'
import { GrantDelegationDto } from './dto/grant-delegation.dto'
import { ListDelegationsDto } from './dto/list-delegations.dto'
import { RequirePermissions } from './permissions.decorator'

/**
 * Admin surface for delegations: list/inspect who has delegated authority to
 * whom, grant a new delegation, and revoke one. Every route requires the
 * user.manage permission.
 */
@Controller('delegations')
@RequirePermissions('user.manage')
export class DelegationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@Query() dto: ListDelegationsDto): Promise<DelegationView[]> {
    return this.queryBus.execute(
      new ListDelegationsQuery({
        delegatorId: dto.delegatorId,
        delegateId: dto.delegateId,
        activeOnly: dto.activeOnly === 'true',
        onDate: dto.onDate,
      }),
    )
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<DelegationView> {
    return this.queryBus.execute(new GetDelegationQuery(id))
  }

  @Post()
  grant(@Body() dto: GrantDelegationDto): Promise<DelegationView> {
    return this.commandBus.execute(
      new GrantDelegationCommand({
        delegatorId: dto.delegatorId,
        delegateId: dto.delegateId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        reason: dto.reason,
      }),
    )
  }

  @Post(':id/revoke')
  revoke(@Param('id') id: string): Promise<DelegationView> {
    return this.commandBus.execute(new RevokeDelegationCommand(id))
  }
}
