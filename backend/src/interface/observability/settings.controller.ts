import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { SETTING_DEFINITIONS } from '../../application/observability/settings/setting-keys'
import { GetSettingQuery } from '../../application/observability/queries/get-setting/get-setting.query'
import { UpdateSettingCommand } from '../../application/observability/commands/update-setting/update-setting.command'
import type {
  SettingKeyView,
  SettingView,
} from '../../application/observability/queries/views/setting.view'
import { CurrentUserId } from '../identity/current-user.decorator'
import { RequirePermissions } from '../identity/permissions.decorator'
import { UpdateSettingDto } from './dto/update-setting.dto'

/**
 * Administration of the system's configurable knobs: the working-hours policy
 * and the request-numbering scheme.
 *
 * Both were already data rather than code -- they live in `system_settings` and
 * every consumer reads them through a port -- but until now the only way to
 * change them was to write the row by hand. This controller closes that gap
 * without touching a single consumer.
 *
 * Guarded by `system.monitor`, the operator permission, for two reasons. These
 * are operational knobs, not user administration, so running the system should
 * not require the power to grant oneself every other privilege; and
 * `system.monitor` is deliberately absent from the working-hours guard's
 * time-restricted list, so an administrator whose working-hours policy is wrong
 * can still fix it outside working hours. Guarding this with a time-boxed
 * permission would have been able to lock the settings away until morning.
 */
@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * The keys an administrator may edit, so a settings screen can be built
   * without hard-coding them in the frontend. Served from the registry rather
   * than from the table: the answer is "what this build supports", which does
   * not depend on which rows happen to exist.
   */
  @Get()
  @RequirePermissions('system.monitor')
  listKeys(): SettingKeyView[] {
    return SETTING_DEFINITIONS.map(({ key, description }) => ({
      key,
      description,
    }))
  }

  @Get(':key')
  @RequirePermissions('system.monitor')
  getOne(@Param('key') key: string): Promise<SettingView> {
    return this.queryBus.execute(new GetSettingQuery(key))
  }

  /**
   * Replaces a setting's value. PUT rather than PATCH because these values are
   * whole documents whose fields constrain one another and are validated
   * together.
   */
  @Put(':key')
  @RequirePermissions('system.monitor')
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUserId() userId: string,
  ): Promise<SettingView> {
    return this.commandBus.execute(
      new UpdateSettingCommand(key, dto.value, userId, dto.description),
    )
  }
}
