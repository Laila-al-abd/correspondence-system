import { ICommandHandler } from '@nestjs/cqrs';
import type { UserAttributeRepository } from '../../../../domain/identity/ports/user-attribute.repository';
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository';
import { ClearUserAttributeCommand } from './clear-user-attribute.command';
export declare class ClearUserAttributeHandler implements ICommandHandler<ClearUserAttributeCommand, void> {
    private readonly attributes;
    private readonly userAttributes;
    constructor(attributes: AttributeDefinitionRepository, userAttributes: UserAttributeRepository);
    execute({ input }: ClearUserAttributeCommand): Promise<void>;
}
