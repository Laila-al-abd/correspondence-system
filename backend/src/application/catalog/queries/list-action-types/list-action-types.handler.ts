import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository'
import { ACTION_TYPE_REPOSITORY } from '../../../tokens'
import { ListActionTypesQuery } from './list-action-types.query'
import { ActionTypeView } from './action-type.view'

@QueryHandler(ListActionTypesQuery)
export class ListActionTypesHandler
  implements IQueryHandler<ListActionTypesQuery, ActionTypeView[]>
{
  constructor(
    @Inject(ACTION_TYPE_REPOSITORY)
    private readonly actionTypes: ActionTypeRepository,
  ) {}

  async execute(query: ListActionTypesQuery): Promise<ActionTypeView[]> {
    const all = await this.actionTypes.list()
    return all
      .filter(
        (at) => query.onlyTerminal === undefined || at.isTerminal === query.onlyTerminal,
      )
      .map((at) => ({
        id: at.id.toString(),
        code: at.code,
        name: at.name.toJSON(),
        isTerminal: at.isTerminal,
      }))
  }
}