import { Inject, Injectable, Logger } from '@nestjs/common'
import type { AttributeDefinitionRepository } from '../../../domain/catalog/ports/attribute-definition.repository'
import type { UserAttributeRepository } from '../../../domain/identity/ports/user-attribute.repository'
import { Identifier } from '../../../domain/shared/identifier'
import {
  ATTRIBUTE_DEFINITION_REPOSITORY,
  USER_ATTRIBUTE_REPOSITORY,
} from '../../tokens'

/** The ABAC attribute that mirrors users.user_type. */
export const USER_TYPE_ATTRIBUTE_CODE = 'user_type'

/**
 * Keeps the `user_type` ABAC attribute in step with the account's own type.
 *
 * There are two separate facts in this system that look like one: the
 * `users.user_type` column, which every account has, and the `user_type` row in
 * `user_attributes`, which is what the eligibility engine actually reads. Until
 * now only the seeded administrator had the second one, so every eligibility
 * rule written against `user_type` silently denied everyone else -- the engine
 * denies by default when a rule names an attribute the user does not hold.
 *
 * Writing it here, in the same transaction that creates the account, means the
 * two cannot drift apart. An administrator can still override the value later
 * through the access API; this only guarantees a value exists from the start.
 *
 * A missing attribute definition is logged rather than thrown: an account is
 * more important than its attribute row, and the seed creates the definition.
 */
@Injectable()
export class UserTypeAttributeWriter {
  private readonly logger = new Logger(UserTypeAttributeWriter.name)

  constructor(
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributes: AttributeDefinitionRepository,
    @Inject(USER_ATTRIBUTE_REPOSITORY)
    private readonly userAttributes: UserAttributeRepository,
  ) {}

  /** Upserts the caller's user type as an ABAC attribute value. */
  async write(userId: Identifier, userType: string): Promise<void> {
    const attribute = await this.attributes.findByCode(USER_TYPE_ATTRIBUTE_CODE)
    if (!attribute) {
      this.logger.warn(
        `No '${USER_TYPE_ATTRIBUTE_CODE}' attribute definition exists, so ` +
          `user ${userId.toString()} was created without one. Eligibility ` +
          'rules that reference it will deny this user until the seed runs.',
      )
      return
    }
    // The definition is TEXT, so the stored value must be a string.
    await this.userAttributes.setValue({
      userId,
      attributeId: attribute.id,
      value: String(userType),
    })
  }
}
