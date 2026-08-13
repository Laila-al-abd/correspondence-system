import { QueryBus } from '@nestjs/cqrs';
import { ActionTypeView } from '../../application/catalog/queries/list-action-types/action-type.view';
export declare class ActionTypeController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    list(onlyTerminal?: string): Promise<ActionTypeView[]>;
}
