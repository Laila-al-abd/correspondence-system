import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
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
import { Public } from './public.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Public self-registration for external applicants only.
   *
   * Answers 202 Accepted with a fixed message whether or not the address was
   * already registered, so the endpoint cannot be used to discover which
   * email addresses have accounts.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  async register(@Body() dto: RegisterUserDto) {
    await this.commandBus.execute(new RegisterUserCommand(dto))
    return {
      status: 'accepted',
      message:
        'If the address is not already registered, the account has been created. You can now sign in.',
    }
  }

  @Public()
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
