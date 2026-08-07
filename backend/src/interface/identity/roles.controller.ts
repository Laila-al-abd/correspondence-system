import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { CreateRoleCommand } from '../../application/identity/commands/create-role/create-role.command'
import { UpdateRoleCommand } from '../../application/identity/commands/update-role/update-role.command'
import { DeleteRoleCommand } from '../../application/identity/commands/delete-role/delete-role.command'
import { GrantPermissionToRoleCommand } from '../../application/identity/commands/grant-permission-to-role/grant-permission-to-role.command'
import { RevokePermissionFromRoleCommand } from '../../application/identity/commands/revoke-permission-from-role/revoke-permission-from-role.command'
import type {
  PermissionGroupView,
  RoleDetailView,
  RoleQueryPort,
  RoleSummaryView,
} from '../../application/identity/ports/role-query.port'
import { ROLE_QUERY } from '../../application/tokens'
import { EntityNotFoundError } from '../../application/errors'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { GrantPermissionDto } from './dto/grant-permission.dto'
import { CurrentUserId } from './current-user.decorator'
import { RequirePermissions } from './permissions.decorator'

/**
 * Role administration: composing roles and deciding what each one grants.
 *
 * Guarded by `role.manage` rather than `user.manage`. Managing accounts and
 * managing authority are different privileges, and only the second can escalate
 * its own holder: anyone who can edit `role_permissions` can give themselves
 * every permission in the system. The seeded Administrator holds both, so the
 * split costs nothing today and means a future "registrar" role can maintain
 * people without being able to rewrite the permission model.
 *
 * What this surface deliberately cannot do:
 *  - invent a permission. Codes are a developer-owned list, enforced by the
 *    guards in the source; a row nobody guards on would be a lie.
 *  - edit a built-in role. Those are seed-owned and would be reverted on the
 *    next deploy.
 *  - leave the installation with nobody able to administer it.
 */
@Controller('roles')
@RequirePermissions('role.manage')
export class RolesController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(ROLE_QUERY) private readonly roles: RoleQueryPort,
  ) {}

  @Get()
  list(): Promise<RoleSummaryView[]> {
    return this.roles.listRoles()
  }

  /**
   * The permission vocabulary, grouped into the folders `permission_groups`
   * exists for. Declared before :roleId, or "permissions" would be read as a
   * role id and always 404.
   */
  @Get('permissions')
  permissions(): Promise<PermissionGroupView[]> {
    return this.roles.listPermissionGroups()
  }

  @Get(':roleId')
  async getOne(@Param('roleId') roleId: string): Promise<RoleDetailView> {
    const found = await this.roles.getRole(roleId)
    if (!found) throw new EntityNotFoundError('Role', roleId)
    return found
  }

  @Post()
  create(@Body() dto: CreateRoleDto, @CurrentUserId() actorId: string) {
    return this.commandBus.execute(
      new CreateRoleCommand({
        name: dto.name,
        description: dto.description,
        permissionCodes: dto.permissionCodes,
        createdBy: actorId,
      }),
    )
  }

  @Patch(':roleId')
  @HttpCode(204)
  update(@Param('roleId') roleId: string, @Body() dto: UpdateRoleDto) {
    return this.commandBus.execute(
      new UpdateRoleCommand({
        roleId,
        name: dto.name,
        description: dto.description,
      }),
    )
  }

  /** Retires a role. Refused while anyone is still assigned to it. */
  @Delete(':roleId')
  @HttpCode(204)
  remove(@Param('roleId') roleId: string) {
    return this.commandBus.execute(new DeleteRoleCommand({ roleId }))
  }

  @Post(':roleId/permissions')
  @HttpCode(204)
  grant(@Param('roleId') roleId: string, @Body() dto: GrantPermissionDto) {
    return this.commandBus.execute(
      new GrantPermissionToRoleCommand({ roleId, permissionCode: dto.code }),
    )
  }

  @Delete(':roleId/permissions/:code')
  @HttpCode(204)
  revoke(@Param('roleId') roleId: string, @Param('code') code: string) {
    return this.commandBus.execute(
      new RevokePermissionFromRoleCommand({ roleId, permissionCode: code }),
    )
  }
}
