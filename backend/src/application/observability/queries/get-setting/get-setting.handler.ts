import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { SystemSettingRepository } from '../../../../domain/observability/ports/system-setting.repository'
import { SYSTEM_SETTING_REPOSITORY } from '../../../tokens'
import { settingDefinition } from '../../settings/setting-keys'
import { SettingView } from '../views/setting.view'
import { GetSettingQuery } from './get-setting.query'

/**
 * Returns the effective value of one setting.
 *
 * Absence of a row is not an error. Nothing in this system requires
 * `system_settings` to be populated -- every consumer falls back to a built-in
 * default -- so a missing row means "still on the defaults", and that is what
 * an administrator opening the screen needs to see and edit from.
 */
@QueryHandler(GetSettingQuery)
export class GetSettingHandler
  implements IQueryHandler<GetSettingQuery, SettingView>
{
  constructor(
    @Inject(SYSTEM_SETTING_REPOSITORY)
    private readonly settings: SystemSettingRepository,
  ) {}

  async execute({ key }: GetSettingQuery): Promise<SettingView> {
    const definition = settingDefinition(key)
    const setting = await this.settings.findByKey(definition.key)

    if (!setting)
      return {
        key: definition.key,
        value: definition.defaultValue,
        description: definition.description,
        configured: false,
      }

    const snapshot = setting.snapshot()
    return {
      key: definition.key,
      value: snapshot.value,
      description: snapshot.description ?? definition.description,
      configured: true,
      updatedAt: snapshot.updatedAt.toISOString(),
      updatedBy: snapshot.updatedBy,
    }
  }
}
