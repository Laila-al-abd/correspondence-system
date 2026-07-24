import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { DefineWorkflowPathCommand } from '../../application/workflow/commands/define-workflow-path/define-workflow-path.command'
import { ActivateWorkflowPathCommand } from '../../application/workflow/commands/activate-workflow-path/activate-workflow-path.command'
import { DeactivateWorkflowPathCommand } from '../../application/workflow/commands/deactivate-workflow-path/deactivate-workflow-path.command'
import { GetWorkflowPathQuery } from '../../application/workflow/queries/get-workflow-path/get-workflow-path.query'
import { ListWorkflowPathsByTemplateQuery } from '../../application/workflow/queries/list-workflow-paths/list-workflow-paths.query'
import { WorkflowPathView } from '../../application/workflow/queries/views/workflow-path.view'
import { DefineWorkflowPathDto } from './dto/define-workflow-path.dto'

@Controller('workflow-paths')
export class WorkflowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  listByTemplate(
    @Query('templateId') templateId: string,
  ): Promise<WorkflowPathView[]> {
    return this.queryBus.execute(
      new ListWorkflowPathsByTemplateQuery(templateId),
    )
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<WorkflowPathView> {
    return this.queryBus.execute(new GetWorkflowPathQuery(id))
  }

  @Post()
  define(
    @Body() dto: DefineWorkflowPathDto,
  ): Promise<{ id: string; stepCount: number; isActive: boolean }> {
    return this.commandBus.execute(new DefineWorkflowPathCommand(dto))
  }

  @Post(':id/activate')
  activate(
    @Param('id') id: string,
  ): Promise<{ id: string; isActive: boolean }> {
    return this.commandBus.execute(new ActivateWorkflowPathCommand(id))
  }

  @Post(':id/deactivate')
  deactivate(
    @Param('id') id: string,
  ): Promise<{ id: string; isActive: boolean }> {
    return this.commandBus.execute(new DeactivateWorkflowPathCommand(id))
  }
}
