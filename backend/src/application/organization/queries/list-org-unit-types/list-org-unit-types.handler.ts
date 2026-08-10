import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { OrgUnitTypeRepository } from '../../../../domain/organization/ports/org-unit-type.repository'
import { ORG_UNIT_TYPE_REPOSITORY } from '../../../tokens'
import { ListOrgUnitTypesQuery } from './list-org-unit-types.query'
import { OrgUnitTypeView } from './org-unit-type.view'

@QueryHandler(ListOrgUnitTypesQuery)
export class ListOrgUnitTypesHandler
  implements IQueryHandler<ListOrgUnitTypesQuery, OrgUnitTypeView[]>
{
  constructor(
    @Inject(ORG_UNIT_TYPE_REPOSITORY)
    private readonly unitTypes: OrgUnitTypeRepository,
  ) {}

  async execute(query: ListOrgUnitTypesQuery): Promise<OrgUnitTypeView[]> {
    const all = await this.unitTypes.list()
    return all.map((ut) => ({
      id: ut.id.toString(),
      code: ut.code,
      name: ut.name.toJSON(),
    }))
  }
}