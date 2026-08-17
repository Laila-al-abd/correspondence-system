import { ICommandHandler } from '@nestjs/cqrs';
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { AttributeDefinitionView } from '../../queries/views/attribute-definition.view';
import { CreateAttributeDefinitionCommand } from './create-attribute-definition.command';
export declare class CreateAttributeDefinitionHandler implements ICommandHandler<CreateAttributeDefinitionCommand, AttributeDefinitionView> {
    private readonly attributes;
    private readonly ids;
    constructor(attributes: AttributeDefinitionRepository, ids: IdGenerator);
    execute({ input, }: CreateAttributeDefinitionCommand): Promise<AttributeDefinitionView>;
}
