import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CurrentUserId } from '../identity/current-user.decorator'
import { SubmitRequestCommand } from '../../application/request/commands/submit-request/submit-request.command'
import { ClassifyRequestByModelCommand } from '../../application/request/commands/classify-request-by-model/classify-request-by-model.command'
import { ClassifyRequestByHumanCommand } from '../../application/request/commands/classify-request-by-human/classify-request-by-human.command'
import { ChangeRequestPriorityCommand } from '../../application/request/commands/change-request-priority/change-request-priority.command'
import {
  PaymentSettlement,
  SettlePaymentCommand,
} from '../../application/request/commands/settle-payment/settle-payment.command'
import { RecordExtractionCommand } from '../../application/request/commands/record-extraction/record-extraction.command'
import { ConfirmRequestCommand } from '../../application/request/commands/confirm-request/confirm-request.command'
import { StartRequestWorkflowCommand } from '../../application/request/commands/start-request-workflow/start-request-workflow.command'
import { AssignStepCommand } from '../../application/request/commands/assign-step/assign-step.command'
import { ActOnStepCommand } from '../../application/request/commands/act-on-step/act-on-step.command'
import { UploadDocumentCommand } from '../../application/request/commands/upload-document/upload-document.command'
import { GetRequestQuery } from '../../application/request/queries/get-request/get-request.query'
import { GetDocumentDownloadUrlQuery } from '../../application/request/queries/get-document-download-url/get-document-download-url.query'
import { GetRequestByReferenceQuery } from '../../application/request/queries/get-request-by-reference/get-request-by-reference.query'
import { ListMyRequestsQuery } from '../../application/request/queries/list-my-requests/list-my-requests.query'
import { ListAssignedRequestsQuery } from '../../application/request/queries/list-assigned-requests/list-assigned-requests.query'
import { ListRequestQueueQuery } from '../../application/request/queries/list-request-queue/list-request-queue.query'
import {
  RequestDetailView,
  RequestSummaryView,
} from '../../application/request/queries/views/request.view'
import { KeysetPage } from '../../application/shared/pagination'
import { PageQueryDto, toNumber } from '../shared/dto/page-query.dto'
import { ListQueueDto } from './dto/list-queue.dto'
import { ListAssignedDto } from './dto/list-assigned.dto'
import { SubmitRequestDto } from './dto/submit-request.dto'
import { ClassifyByModelDto } from './dto/classify-by-model.dto'
import { ClassifyByHumanDto } from './dto/classify-by-human.dto'
import { ChangePriorityDto } from './dto/change-priority.dto'
import { WaivePaymentDto } from './dto/waive-payment.dto'
import { RecordExtractionDto } from './dto/record-extraction.dto'
import { ConfirmRequestDto } from './dto/confirm-request.dto'
import { AssignStepDto } from './dto/assign-step.dto'
import { ActOnStepDto } from './dto/act-on-step.dto'
import { UploadDocumentDto } from './dto/upload-document.dto'
import { DocumentDownloadUrlView } from '../../application/request/queries/get-document-download-url/get-document-download-url.handler'
import { RequirePermissions } from '../identity/permissions.decorator'

/**
 * HTTP surface for the request runtime. Commands drive the lifecycle (submit ->
 * classify -> start workflow -> act on steps -> complete); queries read it back.
 * The caller's id comes from CurrentUserId (the x-user-id stand-in today, a JWT
 * claim later) -- never from the request body.
 */
@Controller('requests')
export class RequestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ----- reads (literal paths declared before ':id' so they win the match) --

  /**
   * All three list routes are paged with a cursor rather than a page number.
   * They are the lists that grow without bound -- one per applicant, one per
   * reviewer, one for the whole institute -- and they are also the lists where
   * rows are inserted constantly. Under offset paging a request filed while a
   * reviewer reads page two slides from the top of page three to the bottom of
   * page two and is never seen. Here that cannot happen: the client asks for
   * what follows the last row it actually received.
   */
  @Get('mine')
  listMine(
    @CurrentUserId() userId: string,
    @Query() page: PageQueryDto,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.queryBus.execute(
      new ListMyRequestsQuery(userId, toNumber(page.limit), page.cursor),
    )
  }

  @Get('assigned')
  listAssigned(
    @CurrentUserId() userId: string,
    @Query() dto: ListAssignedDto,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.queryBus.execute(
      new ListAssignedRequestsQuery(
        userId,
        toNumber(dto.limit),
        dto.cursor,
        // Absent stays absent: only an explicit "true" narrows the list.
        dto.ready === undefined ? undefined : dto.ready === 'true',
      ),
    )
  }

  @Get('queue')
  @RequirePermissions('request.read')
  listQueue(
    @Query() dto: ListQueueDto,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.queryBus.execute(
      new ListRequestQueueQuery(
        dto.status,
        toNumber(dto.limit),
        dto.cursor,
        dto.classificationStatus,
        // Absent stays absent: only an explicit "true" or "false" filters.
        dto.hasFilledData === undefined
          ? undefined
          : dto.hasFilledData === 'true',
        dto.extracted === undefined ? undefined : dto.extracted === 'true',
      ),
    )
  }

  @Get('by-reference/:referenceNo')
  @RequirePermissions('request.read')
  getByReference(
    @Param('referenceNo') referenceNo: string,
  ): Promise<RequestDetailView> {
    return this.queryBus.execute(new GetRequestByReferenceQuery(referenceNo))
  }

  /**
   * Deliberately declares no permission. `request.read` is a staff permission,
   * and requiring it here locked applicants out of the one request that is
   * unambiguously theirs -- they could see a one-line summary in /requests/mine
   * and follow a document link, but never open the request itself. Ownership is
   * checked inside the handler by RequestReadAccessPolicy, which admits the
   * requester or any holder of `request.read` and refuses everyone else.
   */
  @Get(':id')
  getOne(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<RequestDetailView> {
    return this.queryBus.execute(new GetRequestQuery(id, userId))
  }

  // ----- writes -----

  @Post()
  submit(@CurrentUserId() userId: string, @Body() dto: SubmitRequestDto) {
    return this.commandBus.execute(
      new SubmitRequestCommand({ requesterId: userId, ...dto }),
    )
  }

  // Classification is its own permission, not a side effect of request.act.
  // Choosing a request's template decides which workflow it will follow, so it
  // is a different duty from approving a step inside that workflow, and it is
  // held by a different role. Separating the two means a clerk who approves
  // steps cannot silently reroute a request, and a classification reviewer
  // needs no approval rights at all.
  @Post(':id/classify/model')
  @RequirePermissions('request.classify')
  classifyByModel(@Param('id') id: string, @Body() dto: ClassifyByModelDto) {
    return this.commandBus.execute(
      new ClassifyRequestByModelCommand({ requestId: id, ...dto }),
    )
  }

  @Post(':id/classify/human')
  @RequirePermissions('request.classify')
  classifyByHuman(@Param('id') id: string, @Body() dto: ClassifyByHumanDto) {
    return this.commandBus.execute(
      new ClassifyRequestByHumanCommand({ requestId: id, ...dto }),
    )
  }

  /**
   * Re-prioritise one request. The only way a priority moves after
   * classification, and the only place a person's circumstances -- a medical
   * case, an external deadline -- can outrank what the template declared.
   *
   * Behind `request.act`, so it is staff working the queue and never the
   * requester: nobody may put their own paperwork ahead of everyone else's. The
   * reason is required and is stored as a request action.
   */
  @Patch(':id/priority')
  @RequirePermissions('request.act')
  changePriority(
    @CurrentUserId() actorId: string,
    @Param('id') id: string,
    @Body() dto: ChangePriorityDto,
  ) {
    return this.commandBus.execute(
      new ChangeRequestPriorityCommand({ requestId: id, actorId, ...dto }),
    )
  }

  /**
   * Where the extractor writes what it found. PATCH rather than PUT because
   * the body is a fragment of the form and not the form itself: the model
   * answers the questions it can and abstains on the rest, so a request whose
   * nine fields are filled over two runs must not lose the first run's work to
   * the second. The merge happens inside the aggregate, under its version
   * check, so two runs racing cannot overwrite each other either.
   *
   * Guarded by `request.classify` rather than `request.act`: choosing a
   * template and filling its fields from the same text are the same duty, and
   * neither of them is approving anything.
   */
  @Patch(':id/filled-data')
  @RequirePermissions('request.classify')
  recordExtraction(
    @Param('id') id: string,
    @Body() dto: RecordExtractionDto,
  ) {
    return this.commandBus.execute(
      new RecordExtractionCommand({ requestId: id, ...dto }),
    )
  }

  /**
   * The requester accepts or rejects what the models proposed.
   *
   * Carries no `@RequirePermissions`, which makes it a personal route: it is
   * the requester's own request, and the handler checks that the caller is that
   * person. A staff permission here would be wrong twice over -- it would let
   * staff confirm on a student's behalf, and it would put the route behind the
   * working-hours guard, so anyone submitting in the evening could not finish
   * their own submission until the next working morning.
   */
  @Post(':id/confirm')
  confirm(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmRequestDto,
  ) {
    return this.commandBus.execute(
      new ConfirmRequestCommand({ requestId: id, actorId: userId, ...dto }),
    )
  }

  @Post(':id/start')
  @RequirePermissions('request.act')
  start(@Param('id') id: string) {
    return this.commandBus.execute(new StartRequestWorkflowCommand(id))
  }

  /**
   * The money arrived. Behind `request.act` -- the same permission that moves a
   * step -- because settling the fee is part of working the queue, and the
   * requester must never be able to mark their own fee as paid.
   *
   * There is no body: what is being recorded is that this actor, at this time,
   * saw the payment. The amount is not the caller's to state; it was fixed when
   * the fee was raised.
   */
  @Post(':id/payments/:paymentId/confirm')
  @RequirePermissions('payment.settle')
  confirmPayment(
    @CurrentUserId() actorId: string,
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.commandBus.execute(
      new SettlePaymentCommand({
        requestId: id,
        paymentId,
        actorId,
        settlement: PaymentSettlement.CONFIRM,
      }),
    )
  }

  /**
   * The fee is dropped and the request carries on as if it had been paid. A
   * reason is required and is stored both on the payment and as a request
   * action, because this is the decision that costs the institute money.
   */
  @Post(':id/payments/:paymentId/waive')
  @RequirePermissions('payment.settle')
  waivePayment(
    @CurrentUserId() actorId: string,
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: WaivePaymentDto,
  ) {
    return this.commandBus.execute(
      new SettlePaymentCommand({
        requestId: id,
        paymentId,
        actorId,
        settlement: PaymentSettlement.WAIVE,
        reason: dto.reason,
      }),
    )
  }

  @Post(':id/steps/:stepId/assign')
  @RequirePermissions('request.act')
  assignStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() dto: AssignStepDto,
  ) {
    return this.commandBus.execute(
      new AssignStepCommand({
        requestId: id,
        stepInstanceId: stepId,
        assigneeUserId: dto.assigneeUserId,
      }),
    )
  }

  @Post(':id/steps/:stepId/actions')
  @RequirePermissions('request.act')
  actOnStep(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() dto: ActOnStepDto,
  ) {
    return this.commandBus.execute(
      new ActOnStepCommand({
        requestId: id,
        stepInstanceId: stepId,
        actorId: userId,
        action: dto.action,
        actionTypeId: dto.actionTypeId,
        comment: dto.comment,
      }),
    )
  }

  /**
   * Mints a one-minute download link for a single document, on demand.
   *
   * Declared with no @RequirePermissions because the applicant who filed the
   * request must be able to fetch their own attachments, and applicants hold
   * no permissions. The handler authorizes instead: owner, or staff who may
   * read requests.
   */
  @Get(':id/documents/:documentId/download-url')
  getDocumentDownloadUrl(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ): Promise<DocumentDownloadUrlView> {
    return this.queryBus.execute(
      new GetDocumentDownloadUrlQuery(id, documentId, userId),
    )
  }

  @Post(':id/documents')
  uploadDocument(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.commandBus.execute(
      new UploadDocumentCommand({ requestId: id, uploaderId: userId, ...dto }),
    )
  }
}
