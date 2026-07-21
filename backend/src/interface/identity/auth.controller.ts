import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { RegisterUserCommand } from '../../application/identity/commands/register-user/register-user.command'
import {
  AuthenticateUserCommand,
} from '../../application/identity/commands/authenticate-user/authenticate-user.command'
import { RegisterUserDto } from './dto/register-user.dto'
import { LoginDto } from './dto/login.dto'
import { GetEffectivePermissionsQuery } from '../../application/identity/queries/get-effective-permissions/get-effective-permissions.query'
import { CurrentUserId } from './current-user.decorator'
import { PermissionsGuard } from './permissions.guard'
import { RequirePermissions } from './permissions.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.commandBus.execute(new RegisterUserCommand(dto))
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(
      new AuthenticateUserCommand(dto.method ?? 'LOCAL', {
        email: dto.email,
        password: dto.password,
      }),
    )
  }

  /**
   * Returns the caller's effective permission codes — the RBAC pipeline end
   * to end: identify the user, aggregate their roles, resolve permissions.
   */
  @Get('me/permissions')
  myPermissions(@CurrentUserId() userId: string) {
    return this.queryBus.execute(new GetEffectivePermissionsQuery(userId))
  }

  /**
   * Example protected route. The PermissionsGuard lets the request through
   * only if the caller's effective permissions include `user.manage`;
   * otherwise it responds 403.
   */
  @Get('admin/ping')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('user.manage')
  adminPing() {
    return { status: 'ok', message: 'You have the user.manage permission.' }
  }
}
