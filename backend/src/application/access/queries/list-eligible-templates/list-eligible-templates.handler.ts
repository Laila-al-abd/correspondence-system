import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { TEMPLATE_REPOSITORY } from '../../../tokens'
import { EvaluateEligibility } from '../../evaluate-eligibility'
import {
  EligibleTemplateView,
  toEligibleTemplateView,
} from '../views/eligible-template.view'
import { ListEligibleTemplatesQuery } from './list-eligible-templates.query'

@QueryHandler(ListEligibleTemplatesQuery)
export class ListEligibleTemplatesHandler
  implements IQueryHandler<ListEligibleTemplatesQuery, EligibleTemplateView[]>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    private readonly evaluator: EvaluateEligibility,
  ) {}

  async execute({
    userId,
  }: ListEligibleTemplatesQuery): Promise<EligibleTemplateView[]> {
    const uid = Identifier.of(userId)
    const [templates, attributes, codes] = await Promise.all([
      this.templates.listActive(),
      this.evaluator.resolveAttributes(uid),
      this.evaluator.attributeCodeMap(),
    ])

    const eligible: EligibleTemplateView[] = []
    for (const template of templates) {
      const result = await this.evaluator.evaluateWith(
        uid,
        template,
        attributes,
        codes,
      )
      if (result.eligible) eligible.push(toEligibleTemplateView(template))
    }
    return eligible
  }
}
