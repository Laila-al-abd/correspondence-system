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
  listQueue(@Query('status') status: string): Promise<RequestSummaryView[]> {
    return this.queryBus.execute(new ListRequestQueueQuery(status))
  }

  @Get('by-reference/:referenceNo')
  getByReference(
    @Param('referenceNo') referenceNo: string,
  ): Promise<RequestDetailView> {
    return this.queryBus.execute(new GetRequestByReferenceQuery(referenceNo))
  }

  @Get(':id')
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

  @Post(':id/classify/model')
  classifyByModel(@Param('id') id: string, @Body() dto: ClassifyByModelDto) {
    return this.commandBus.execute(
      new ClassifyRequestByModelCommand({ requestId: id, ...dto }),
    )
  }

  @Post(':id/classify/human')
  classifyByHuman(@Param('id') id: string, @Body() dto: ClassifyByHumanDto) {
    return this.commandBus.execute(
      new ClassifyRequestByHumanCommand({ requestId: id, ...dto }),
    )
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.commandBus.execute(new StartRequestWorkflowCommand(id))
  }

  @Post(':id/steps/:stepId/assign')
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
