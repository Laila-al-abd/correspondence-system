import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY, TEMPLATE_REPOSITORY } from '../../../tokens'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { EntityNotFoundError, FilledDataInvalidError } from '../../../errors'
import { TemplateSubmissionPolicy } from '../../services/template-submission-policy'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
import { ClassifyRequestByHumanCommand } from './classify-request-by-human.command'

export interface HumanClassificationResult {
  id: string
  classificationStatus: string
  /** How many form fields the reviewer filled in the same call. */
  fieldsWritten: number
}

/**
 * A human resolves the classification (the HITL path).
 *
 * They choose the template and, in the same call, fill the form. The extractor
 * is deliberately not run afterwards: this request is here precisely because
 * its text was too ambiguous for a model to read confidently, so a second
 * machine pass over the same sentence is the least likely thing in the system
 * to succeed -- and when it fails the requester disputes and the request lands
 * back in this queue, having cost two model calls and a round trip to say
 * nothing. The person is already reading the text; they answer the questions
 * while they are there.
 *
 * Priority is not theirs to set either. It follows the template they chose, and
 * a reviewer who thinks this one request deserves different treatment says so
 * through PATCH /requests/:id/priority, which records the reason.
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
    private readonly notifier: NotificationEmitter,
    private readonly events: EventRecorder,
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

    const stageBefore = stageOfRequest(request)

    request.classifyByHuman(
      Identifier.of(input.templateId),
      template.defaultPriority,
    )

    // Checked against the template the reviewer just chose, and only the keys
    // they sent: the form is being filled, not submitted, so absent fields are
    // unanswered rather than wrong. Unknown keys and wrong types are refused --
    // a reviewer typing into the wrong form should hear about it now.
    let fieldsWritten = 0
    if (input.filledData) {
      const violations = template.validatePartial(input.filledData)
      if (violations.length > 0) throw new FilledDataInvalidError(violations)
      request.setFilledData(input.filledData)
      fieldsWritten = Object.keys(input.filledData).length
    }

    // The extractor is not going to run on this one -- see the note above -- so
    // the attempt is stamped here. Without it the request would drop straight
    // into the extraction backlog and be collected on the next poll, which is
    // the machine pass this path exists to avoid.
    request.markExtractionAttempted()

    await this.requests.save(request)

    // Appended outside a transaction because this handler has none: the save
    // above is one statement, so there is no half-written state for the audit
    // row to disagree with.
    await this.events.statusChanged({
      requestId: request.id.toString(),
      from: stageBefore,
      to: stageOfRequest(request),
    })

    // Same prompt as the model path: the reviewer has decided what this is and
    // filled what they could, and the requester is now the only person who can
    // finish the form and start the work.
    await this.notifier.confirmationRequired({
      requesterId: request.requesterId.toString(),
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
    })

    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
      fieldsWritten,
    }
  }
}
