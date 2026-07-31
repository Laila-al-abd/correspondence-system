import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Priority } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY, TEMPLATE_REPOSITORY } from '../../../tokens'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { EntityNotFoundError } from '../../../errors'
import { TemplateSubmissionPolicy } from '../../services/template-submission-policy'
import { ClassifyRequestByHumanCommand } from './classify-request-by-human.command'

export interface HumanClassificationResult {
  id: string
  classificationStatus: string
}

/**
 * A human resolves the classification (the HITL path): they confirm the
 * template and may set the priority. Used when the model was not confident.
 */
@CommandHandler(ClassifyRequestByHumanCommand)
export class ClassifyRequestByHumanHandler
  implements
    ICommandHandler<ClassifyRequestByHumanCommand, HumanClassificationResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
    private readonly submissionPolicy: TemplateSubmissionPolicy,
  ) {}

  async execute({
    input,
  }: ClassifyRequestByHumanCommand): Promise<HumanClassificationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const template = await this.templates.findById(
      Identifier.of(input.templateId),
    )
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    // The same gate as the automatic path. A reviewer resolving a low-confidence
    // classification may not place a request on a template its requester is not
    // eligible for, and may not bind it to a template its form data contradicts.
    await this.submissionPolicy.assertMayBeClassifiedAs(request, template)

    request.classifyByHuman(
      Identifier.of(input.templateId),
      input.priority ? (input.priority as Priority) : undefined,
    )
    await this.requests.save(request)
    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
    }
  }
}
