import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { TEMPLATE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import {
  EvaluateEligibility,
  TemplateEligibilityView,
} from '../../evaluate-eligibility'
import { CheckTemplateEligibilityQuery } from './check-template-eligibility.query'

@QueryHandler(CheckTemplateEligibilityQuery)
export class CheckTemplateEligibilityHandler
  implements
    IQueryHandler<CheckTemplateEligibilityQuery, TemplateEligibilityView>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    private readonly evaluator: EvaluateEligibility,
  ) {}

  async execute({
    userId,
    templateId,
  }: CheckTemplateEligibilityQuery): Promise<TemplateEligibilityView> {
    const template = await this.templates.findById(Identifier.of(templateId))
    if (!template) throw new EntityNotFoundError('Template', templateId)
    return this.evaluator.evaluate(Identifier.of(userId), template)
  }
}
