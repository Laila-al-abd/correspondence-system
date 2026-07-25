import {
  Body,
  Controller,
  Delete,
  HttpCode,
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
import { AssignRoleDto } from './dto/assign-role.dto'
import { SetUserAttributeDto } from './dto/set-user-attribute.dto'
import { RequirePermissions } from './permissions.decorator'
import { CurrentUserId } from './current-user.decorator'

/**
 * Admin surface for user administration: granting and revoking roles (optionally
 * scoped to a department) and maintaining a user's ABAC attribute values. Every
 * route requires the user.manage permission.
 */
@Controller('users')
@RequirePermissions('user.manage')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

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
        assignedBy: actorId,
      }),
    )
  }

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
