import { IQueryHandler } from '@nestjs/cqrs';
import type { OrgUnitTypeRepository } from '../../../../domain/organization/ports/org-unit-type.repository';
import { ListOrgUnitTypesQuery } from './list-org-unit-types.query';
import { OrgUnitTypeView } from './org-unit-type.view';
export declare class ListOrgUnitTypesHandler implements IQueryHandler<ListOrgUnitTypesQuery, OrgUnitTypeView[]> {
    private readonly unitTypes;
    constructor(unitTypes: OrgUnitTypeRepository);
    execute(query: ListOrgUnitTypesQuery): Promise<OrgUnitTypeView[]>;
}
