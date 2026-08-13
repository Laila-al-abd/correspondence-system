import { ICommandHandler } from '@nestjs/cqrs';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import type { UserAttributeRepository } from '../../../../domain/identity/ports/user-attribute.repository';
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository';
import { SetUserAttributeCommand } from './set-user-attribute.command';
export interface SetUserAttributeResult {
    userId: string;
    attributeCode: string;
    value: unknown;
}
export declare class SetUserAttributeHandler implements ICommandHandler<SetUserAttributeCommand, SetUserAttributeResult> {
    private readonly users;
    private readonly attributes;
    private readonly userAttributes;
    constructor(users: UserRepository, attributes: AttributeDefinitionRepository, userAttributes: UserAttributeRepository);
    execute({ input, }: SetUserAttributeCommand): Promise<SetUserAttributeResult>;
    private assertValueMatchesType;
}
