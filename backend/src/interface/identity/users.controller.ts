import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { AssignRoleToUserCommand } from '../../application/identity/commands/assign-role-to-user/assign-role-to-user.command'
import { RevokeRoleFromUserCommand } from '../../application/identity/commands/revoke-role-from-user/revoke-role-from-user.command'
import { SetUserAttributeCommand } from '../../application/identity/commands/set-user-attribute/set-user-attribute.command'
import { ClearUserAttributeCommand } from '../../application/identity/commands/clear-user-attribute/clear-user-attribute.command'
import { CreateUserCommand } from '../../application/identity/commands/create-user/create-user.command'
import { SyncUsersCommand } from '../../application/identity/commands/sync-users/sync-users.command'
import { AssignRoleDto } from './dto/assign-role.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { SetUserAttributeDto } from './dto/set-user-attribute.dto'
import { RequirePermissions } from './permissions.decorator'
import { CurrentUserId } from './current-user.decorator'
import { ListUsersDto } from './dto/list-users.dto'
import type {
  ListUsersResult,
  UserDetailView,
  UserQueryPort,
} from '../../application/identity/ports/user-query.port'
import { USER_QUERY } from '../../application/tokens'
import { EntityNotFoundError } from '../../application/errors'

/**
 * Admin surface for user administration: granting and revoking roles (optionally
 * scoped to a department) and maintaining a user's ABAC attribute values. Every
 * route requires the user.manage permission.
 */
@Controller('users')
@RequirePermissions('user.manage')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(USER_QUERY) private readonly users: UserQueryPort,
  ) {}

  // List/search users with pagination (admin directory).
  @Get()
  list(@Query() dto: ListUsersDto): Promise<ListUsersResult> {
    return this.users.list({
      search: dto.search,
      userType: dto.userType,
      status: dto.status,
      departmentId: dto.departmentId,
      limit: dto.limit ? Number(dto.limit) : undefined,
      offset: dto.offset ? Number(dto.offset) : undefined,
    })
  }

  // One user with their roles and ABAC attributes.
  @Get(':userId')
  async getOne(@Param('userId') userId: string): Promise<UserDetailView> {
    const found = await this.users.getDetail(userId)
    if (!found) throw new EntityNotFoundError('User', userId)
    return found
  }

  /**
   * Provision a member of staff or a student. The only hand-operated way to
   * create an account that carries an institutional number.
   */
  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUserId() actorId: string) {
    return this.commandBus.execute(
      new CreateUserCommand({ ...dto, createdBy: actorId }),
    )
  }

  /**
   * Import people from the external personnel directory -- the non-manual
   * alternative to the endpoint above, and the counterpart of
   * POST /organization/departments/sync. Run the department sync first: a
   * person's unit is resolved against departments already imported from the
   * same source.
   */
  @Post('sync')
  syncFromDirectory(@Query('source') source?: string) {
    return this.commandBus.execute(new SyncUsersCommand(source))
  }

  /**
   * Grant a role, optionally scoped to a department and optionally expiring.
   *
   * Requires `role.manage` as well as the controller's `user.manage`: handing
   * out a role hands out authority. Route metadata overrides the class rather
   * than adding to it, so both codes are named here.
   */
  @RequirePermissions('user.manage', 'role.manage')
  @Post(':userId/roles')
  assignRole(
    @Param('userId') userId: string,
    @Body() dto: AssignRoleDto,
    @CurrentUserId() actorId: string,
  ) {
    return this.commandBus.execute(
      new AssignRoleToUserCommand({
        userId,
        roleId: dto.roleId,
        departmentId: dto.departmentId,
        expiresAt: dto.expiresAt,
        reason: dto.reason,
        assignedBy: actorId,
      }),
    )
  }

  // Taking authority away is the same privilege as handing it out.
  @RequirePermissions('user.manage', 'role.manage')
  @Delete(':userId/roles/:roleId')
  @HttpCode(204)
  revokeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.commandBus.execute(
      new RevokeRoleFromUserCommand({ userId, roleId, departmentId }),
    )
  }

  @Put(':userId/attributes')
  setAttribute(
    @Param('userId') userId: string,
    @Body() dto: SetUserAttributeDto,
  ) {
    return this.commandBus.execute(
      new SetUserAttributeCommand({
        userId,
        attributeCode: dto.attributeCode,
        value: dto.value,
      }),
    )
  }

  @Delete(':userId/attributes/:attributeCode')
  @HttpCode(204)
  clearAttribute(
    @Param('userId') userId: string,
    @Param('attributeCode') attributeCode: string,
  ) {
    return this.commandBus.execute(
      new ClearUserAttributeCommand({ userId, attributeCode }),
    )
  }
}
