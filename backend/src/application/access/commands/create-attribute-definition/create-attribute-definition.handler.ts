import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AttributeDefinition } from '../../../../domain/catalog/attribute-definition'
import { AttributeOption } from '../../../../domain/catalog/attribute-option'
import { AttributeDataType } from '../../../../domain/catalog/enums'
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import { ATTRIBUTE_DEFINITION_REPOSITORY, ID_GENERATOR } from '../../../tokens'
import {
  AttributeDefinitionView,
  toAttributeDefinitionView,
} from '../../queries/views/attribute-definition.view'
import { CreateAttributeDefinitionCommand } from './create-attribute-definition.command'

/**
 * Adds one attribute to the ABAC vocabulary.
 *
 * The vocabulary is what template eligibility rules are written against and
 * what user attribute values are recorded under, so a definition is reference
 * data with real consequences: its code becomes the name every rule uses, and
 * its data type decides how stored values are compared. Both are therefore
 * settled here, at creation, and the aggregate enforces the option rule (an
 * ENUM must offer at least one choice; nothing else may offer any) rather than
 * this handler restating it.
 *
 * The code is normalised to lower_snake_case before the uniqueness check, so
 * "GPA" and "gpa" cannot become two attributes that look like one in a rule.
 */
@CommandHandler(CreateAttributeDefinitionCommand)
export class CreateAttributeDefinitionHandler
  implements
    ICommandHandler<CreateAttributeDefinitionCommand, AttributeDefinitionView>
{
  constructor(
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributes: AttributeDefinitionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({
    input,
  }: CreateAttributeDefinitionCommand): Promise<AttributeDefinitionView> {
    const code = input.code.trim().toLowerCase()

    const existing = await this.attributes.findByCode(code)
    if (existing)
      throw new InvariantViolationError(
        `An attribute with the code "${code}" already exists. Attribute codes ` +
          'are how eligibility rules name what they compare, so they cannot be ' +
          'reused.',
      )

    const dataType = input.dataType as AttributeDataType
    const options = (input.options ?? []).map((option, index) =>
      AttributeOption.create(this.ids.next(), {
        value: option.value.trim(),
        label: LocalizedText.create(option.labelAr, option.labelEn),
        // Position in the submitted list is the display order unless the caller
        // states one, so an admin who just types the choices in order gets it.
        ordinal: option.ordinal ?? index,
      }),
    )

    const definition = AttributeDefinition.create(this.ids.next(), {
      code,
      label: LocalizedText.create(input.labelAr, input.labelEn),
      dataType,
      description: input.descriptionAr
        ? LocalizedText.create(input.descriptionAr, input.descriptionEn)
        : undefined,
      options,
    })

    await this.attributes.save(definition)
    return toAttributeDefinitionView(definition)
  }
}
