import { IQueryHandler } from '@nestjs/cqrs';
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import { ListActionTypesQuery } from './list-action-types.query';
import { ActionTypeView } from './action-type.view';
export declare class ListActionTypesHandler implements IQueryHandler<ListActionTypesQuery, ActionTypeView[]> {
    private readonly actionTypes;
    constructor(actionTypes: ActionTypeRepository);
    execute(query: ListActionTypesQuery): Promise<ActionTypeView[]>;
}
