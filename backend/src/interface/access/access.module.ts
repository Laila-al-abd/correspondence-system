import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaTemplateRepository } from '../../infrastructure/catalog/prisma-template.repository'
import { PrismaAttributeDefinitionRepository } from '../../infrastructure/catalog/prisma-attribute-definition.repository'
import { PrismaUserAttributeRepository } from '../../infrastructure/identity/prisma-user-attribute.repository'
import { EvaluateEligibility } from '../../application/access/evaluate-eligibility'
import { CheckTemplateEligibilityHandler } from '../../application/access/queries/check-template-eligibility/check-template-eligibility.handler'
import { ListEligibleTemplatesHandler } from '../../application/access/queries/list-eligible-templates/list-eligible-templates.handler'
import { ListAttributeDefinitionsHandler } from '../../application/access/queries/list-attribute-definitions/list-attribute-definitions.handler'
import { AddEligibilityRuleHandler } from '../../application/access/commands/add-eligibility-rule/add-eligibility-rule.handler'
import { RemoveEligibilityRuleHandler } from '../../application/access/commands/remove-eligibility-rule/remove-eligibility-rule.handler'
import { ListEligibilityRulesHandler } from '../../application/access/queries/list-eligibility-rules/list-eligibility-rules.handler'
import { UuidV7IdGenerator } from '../../infrastructure/shared/uuid-v7-id.generator'
import {
  ATTRIBUTE_DEFINITION_REPOSITORY,
  ID_GENERATOR,
  TEMPLATE_REPOSITORY,
  USER_ATTRIBUTE_REPOSITORY,
} from '../../application/tokens'
import { AccessController } from './access.controller'

const handlers = [
  CheckTemplateEligibilityHandler,
  ListEligibleTemplatesHandler,
  ListAttributeDefinitionsHandler,
  AddEligibilityRuleHandler,
  RemoveEligibilityRuleHandler,
  ListEligibilityRulesHandler,
]

/**
 * Access (ABAC) composition root. Wires the attribute-based eligibility engine:
 * it evaluates a template's eligibility rules against a user's resolved
 * attribute values. Binds the template, attribute-definition, and user-attribute
 * read ports to their Prisma adapters and exposes the engine over HTTP.
 */
@Module({
  imports: [CqrsModule],
  controllers: [AccessController],
  providers: [
    ...handlers,
    { provide: TEMPLATE_REPOSITORY, useClass: PrismaTemplateRepository },
    { provide: ID_GENERATOR, useClass: UuidV7IdGenerator },
    {
      provide: ATTRIBUTE_DEFINITION_REPOSITORY,
      useClass: PrismaAttributeDefinitionRepository,
    },
    {
      provide: USER_ATTRIBUTE_REPOSITORY,
      useClass: PrismaUserAttributeRepository,
    },
    {
      provide: EvaluateEligibility,
      useFactory: (
        userAttributes: PrismaUserAttributeRepository,
        attributeDefinitions: PrismaAttributeDefinitionRepository,
      ) => new EvaluateEligibility(userAttributes, attributeDefinitions),
      inject: [USER_ATTRIBUTE_REPOSITORY, ATTRIBUTE_DEFINITION_REPOSITORY],
    },
  ],
})
export class AccessModule {}
