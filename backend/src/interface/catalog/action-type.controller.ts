import { Controller, Get, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ListActionTypesQuery } from '../../application/catalog/queries/list-action-types/list-action-types.query'
import { ActionTypeView } from '../../application/catalog/queries/list-action-types/action-type.view'
import { RequirePermissions } from '../identity/permissions.decorator'

@Controller('action-types')
@RequirePermissions('workflow.manage', 'request.act')
export class ActionTypeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  list(@Query('onlyTerminal') onlyTerminal?: string): Promise<ActionTypeView[]> {
    const filter = onlyTerminal === 'true' ? true : onlyTerminal === 'false' ? false : undefined
    return this.queryBus.execute(new ListActionTypesQuery(filter))
  }
}