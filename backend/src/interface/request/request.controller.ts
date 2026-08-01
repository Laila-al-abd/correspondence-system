import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CurrentUserId } from '../identity/current-user.decorator'
import { SubmitRequestCommand } from '../../application/request/commands/submit-request/submit-request.command'
import { ClassifyRequestByModelCommand } from '../../application/request/commands/classify-request-by-model/classify-request-by-model.command'
import { ClassifyRequestByHumanCommand } from '../../application/request/commands/classify-request-by-human/classify-request-by-human.command'
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
import { SubmitRequestDto } from './dto/submit-request.dto'
import { ClassifyByModelDto } from './dto/classify-by-model.dto'
import { ClassifyByHumanDto } from './dto/classify-by-human.dto'
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

  @Get('mine')
  listMine(@CurrentUserId() userId: string): Promise<RequestSummaryView[]> {
    return this.queryBus.execute(new ListMyRequestsQuery(userId))
  }

  @Get('assigned')
  listAssigned(@CurrentUserId() userId: string): Promise<RequestSummaryView[]> {
    return this.queryBus.execute(new ListAssignedRequestsQuery(userId))
  }

  @Get('queue')
  @RequirePermissions('request.read')
  listQueue(@Query('status') status: string): Promise<RequestSummaryView[]> {
    return this.queryBus.execute(new ListRequestQueueQuery(status))
  }

  @Get('by-reference/:referenceNo')
  @RequirePermissions('request.read')
  getByReference(
    @Param('referenceNo') referenceNo: string,
  ): Promise<RequestDetailView> {
    return this.queryBus.execute(new GetRequestByReferenceQuery(referenceNo))
  }

  @Get(':id')
  @RequirePermissions('request.read')
  getOne(@Param('id') id: string): Promise<RequestDetailView> {
    return this.queryBus.execute(new GetRequestQuery(id))
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

  @Post(':id/start')
  @RequirePermissions('request.act')
  start(@Param('id') id: string) {
    return this.commandBus.execute(new StartRequestWorkflowCommand(id))
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
