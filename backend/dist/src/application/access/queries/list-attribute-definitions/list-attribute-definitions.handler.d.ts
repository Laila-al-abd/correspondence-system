import { IQueryHandler } from '@nestjs/cqrs';
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository';
import { AttributeDefinitionView } from '../views/attribute-definition.view';
import { ListAttributeDefinitionsQuery } from './list-attribute-definitions.query';
export declare class ListAttributeDefinitionsHandler implements IQueryHandler<ListAttributeDefinitionsQuery, AttributeDefinitionView[]> {
    private readonly attributeDefinitions;
    constructor(attributeDefinitions: AttributeDefinitionRepository);
    execute(): Promise<AttributeDefinitionView[]>;
}
