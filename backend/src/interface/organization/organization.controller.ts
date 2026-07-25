import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SyncDepartmentsCommand } from '../../application/organization/commands/sync-departments/sync-departments.command'
import { SyncDepartmentsResult } from '../../application/organization/sync-departments-from-directory'
import { SyncDepartmentsDto } from './dto/sync-departments.dto'
import { RequirePermissions } from '../identity/permissions.decorator'

@Controller('organization/departments')
@RequirePermissions('user.manage')
export class OrganizationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('sync')
  sync(@Body() dto: SyncDepartmentsDto): Promise<SyncDepartmentsResult> {
    return this.commandBus.execute(new SyncDepartmentsCommand(dto.source))
  }
}
