import { Controller, Get, Param } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { CheckTemplateEligibilityQuery } from '../../application/access/queries/check-template-eligibility/check-template-eligibility.query'
import { ListEligibleTemplatesQuery } from '../../application/access/queries/list-eligible-templates/list-eligible-templates.query'
import { ListAttributeDefinitionsQuery } from '../../application/access/queries/list-attribute-definitions/list-attribute-definitions.query'
import { TemplateEligibilityView } from '../../application/access/evaluate-eligibility'
import { EligibleTemplateView } from '../../application/access/queries/views/eligible-template.view'
import { AttributeDefinitionView } from '../../application/access/queries/views/attribute-definition.view'

@Controller('access')
export class AccessController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('attributes')
  attributes(): Promise<AttributeDefinitionView[]> {
    return this.queryBus.execute(new ListAttributeDefinitionsQuery())
  }

  @Get('users/:userId/eligible-templates')
  eligibleTemplates(
    @Param('userId') userId: string,
  ): Promise<EligibleTemplateView[]> {
    return this.queryBus.execute(new ListEligibleTemplatesQuery(userId))
  }

  @Get('users/:userId/templates/:templateId/eligibility')
  checkEligibility(
    @Param('userId') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<TemplateEligibilityView> {
    return this.queryBus.execute(
      new CheckTemplateEligibilityQuery(userId, templateId),
    )
  }
}
