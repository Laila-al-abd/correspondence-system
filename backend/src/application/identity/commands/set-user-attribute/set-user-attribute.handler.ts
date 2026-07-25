import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import type { UserAttributeRepository } from '../../../../domain/identity/ports/user-attribute.repository'
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository'
import { AttributeDataType } from '../../../../domain/catalog/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import {
  ATTRIBUTE_DEFINITION_REPOSITORY,
  USER_ATTRIBUTE_REPOSITORY,
  USER_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { SetUserAttributeCommand } from './set-user-attribute.command'

export interface SetUserAttributeResult {
  userId: string
  attributeCode: string
  value: unknown
}

/**
 * Sets (creates or overwrites) a single ABAC attribute value for a user. The
 * attribute must exist in the vocabulary, and the value must match its declared
 * data type. These values feed the template eligibility engine.
 */
@CommandHandler(SetUserAttributeCommand)
export class SetUserAttributeHandler
  implements ICommandHandler<SetUserAttributeCommand, SetUserAttributeResult>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributes: AttributeDefinitionRepository,
    @Inject(USER_ATTRIBUTE_REPOSITORY)
    private readonly userAttributes: UserAttributeRepository,
  ) {}

  async execute({
    input,
  }: SetUserAttributeCommand): Promise<SetUserAttributeResult> {
    const userId = Identifier.of(input.userId)
    if (!(await this.users.findById(userId)))
      throw new EntityNotFoundError('User', input.userId)

    const attribute = await this.attributes.findByCode(input.attributeCode)
    if (!attribute)
      throw new EntityNotFoundError('Attribute', input.attributeCode)

    this.assertValueMatchesType(attribute.dataType, input.value)

    await this.userAttributes.setValue({
      userId,
      attributeId: attribute.id,
      value: input.value,
    })

    return {
      userId: input.userId,
      attributeCode: input.attributeCode,
      value: input.value,
    }
  }

  private assertValueMatchesType(
    dataType: AttributeDataType,
    value: unknown,
  ): void {
    const fail = (expected: string): never => {
      throw new InvariantViolationError(
        `Attribute value must be a ${expected} for data type ${dataType}.`,
      )
    }
    switch (dataType) {
      case AttributeDataType.NUMBER:
        if (typeof value !== 'number' || Number.isNaN(value)) fail('number')
        break
      case AttributeDataType.BOOLEAN:
        if (typeof value !== 'boolean') fail('boolean')
        break
      case AttributeDataType.DATE:
        if (typeof value !== 'string' || Number.isNaN(Date.parse(value)))
          fail('date string')
        break
      case AttributeDataType.TEXT:
      case AttributeDataType.ENUM:
      default:
        if (typeof value !== 'string') fail('string')
        break
    }
  }
}
