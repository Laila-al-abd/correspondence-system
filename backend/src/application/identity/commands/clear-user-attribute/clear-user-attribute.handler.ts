import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { UserAttributeRepository } from '../../../../domain/identity/ports/user-attribute.repository'
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import {
  ATTRIBUTE_DEFINITION_REPOSITORY,
  USER_ATTRIBUTE_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { ClearUserAttributeCommand } from './clear-user-attribute.command'

/**
 * Clears a user's value for one ABAC attribute. The attribute must exist in the
 * vocabulary; clearing a value the user does not have is a no-op.
 */
@CommandHandler(ClearUserAttributeCommand)
export class ClearUserAttributeHandler
  implements ICommandHandler<ClearUserAttributeCommand, void>
{
  constructor(
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributes: AttributeDefinitionRepository,
    @Inject(USER_ATTRIBUTE_REPOSITORY)
    private readonly userAttributes: UserAttributeRepository,
  ) {}

  async execute({ input }: ClearUserAttributeCommand): Promise<void> {
    const attribute = await this.attributes.findByCode(input.attributeCode)
    if (!attribute)
      throw new EntityNotFoundError('Attribute', input.attributeCode)
    await this.userAttributes.clear({
      userId: Identifier.of(input.userId),
      attributeId: attribute.id,
    })
  }
}
