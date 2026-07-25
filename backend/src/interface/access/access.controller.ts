import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CheckTemplateEligibilityQuery } from '../../application/access/queries/check-template-eligibility/check-template-eligibility.query'
import { ListEligibleTemplatesQuery } from '../../application/access/queries/list-eligible-templates/list-eligible-templates.query'
import { ListAttributeDefinitionsQuery } from '../../application/access/queries/list-attribute-definitions/list-attribute-definitions.query'
import { TemplateEligibilityView } from '../../application/access/evaluate-eligibility'
import { EligibleTemplateView } from '../../application/access/queries/views/eligible-template.view'
import { AttributeDefinitionView } from '../../application/access/queries/views/attribute-definition.view'
import { RequirePermissions } from '../identity/permissions.decorator'
import { AddEligibilityRuleCommand } from '../../application/access/commands/add-eligibility-rule/add-eligibility-rule.command'
import { RemoveEligibilityRuleCommand } from '../../application/access/commands/remove-eligibility-rule/remove-eligibility-rule.command'
import { ListEligibilityRulesQuery } from '../../application/access/queries/list-eligibility-rules/list-eligibility-rules.query'
import { EligibilityRuleView } from '../../application/access/queries/views/eligibility-rule.view'
import { AddEligibilityRuleDto } from './dto/add-eligibility-rule.dto'

@Controller('access')
@RequirePermissions('template.manage')
export class AccessController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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

  @Get('templates/:templateId/eligibility-rules')
  listRules(
    @Param('templateId') templateId: string,
  ): Promise<EligibilityRuleView[]> {
    return this.queryBus.execute(new ListEligibilityRulesQuery(templateId))
  }

  @Post('templates/:templateId/eligibility-rules')
  addRule(
    @Param('templateId') templateId: string,
    @Body() dto: AddEligibilityRuleDto,
  ): Promise<EligibilityRuleView> {
    return this.commandBus.execute(
      new AddEligibilityRuleCommand({
        templateId,
        attributeCode: dto.attributeCode,
        operator: dto.operator,
        value: dto.value,
      }),
    )
  }

  @Delete('templates/:templateId/eligibility-rules/:ruleId')
  @HttpCode(204)
  removeRule(
    @Param('templateId') templateId: string,
    @Param('ruleId') ruleId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new RemoveEligibilityRuleCommand({ templateId, ruleId }),
    )
  }
}
