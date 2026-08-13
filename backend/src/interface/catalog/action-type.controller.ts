import { Controller, Get, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ListActionTypesQuery } from '../../application/catalog/queries/list-action-types/list-action-types.query'
import { ActionTypeView } from '../../application/catalog/queries/list-action-types/action-type.view'
import { RequireAnyPermission } from '../identity/permissions.decorator'

// Two different jobs need this catalogue: whoever authors a workflow picks the
// action types a step permits, and whoever works that step picks one to apply.
// @RequirePermissions demands ALL listed codes, so an ordinary actor -- who
// holds request.act but not workflow.manage -- was refused with 403 here. The
// step form swallowed the failure and rendered an empty action dropdown, which
// looked like "the allowed actions are not loading" rather than a permission
// error. Either code is sufficient.
@Controller('action-types')
@RequireAnyPermission('workflow.manage', 'request.act')
export class ActionTypeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  list(@Query('onlyTerminal') onlyTerminal?: string): Promise<ActionTypeView[]> {
    const filter = onlyTerminal === 'true' ? true : onlyTerminal === 'false' ? false : undefined
    return this.queryBus.execute(new ListActionTypesQuery(filter))
  }
}