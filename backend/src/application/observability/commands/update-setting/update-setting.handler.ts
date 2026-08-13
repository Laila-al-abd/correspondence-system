import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SystemSetting } from '../../../../domain/observability/system-setting'
import type { SystemSettingRepository } from '../../../../domain/observability/ports/system-setting.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Identifier } from '../../../../domain/shared/identifier'
import { ID_GENERATOR, SYSTEM_SETTING_REPOSITORY } from '../../../tokens'
import { BusinessHoursService } from '../../services/business-hours.service'
import { settingDefinition } from '../../settings/setting-keys'
import { SettingView } from '../../queries/views/setting.view'
import { UpdateSettingCommand } from './update-setting.command'

/**
 * Writes one administrable setting: upsert by key, then clear whatever cached
 * copy of it exists in the process.
 *
 * Order matters. The value is validated before anything is written, so a
 * rejected value leaves the running configuration untouched; and the cache is
 * cleared only after the row is safely saved, so no reader can ever be pointed
 * at a value that failed to persist.
 *
 * BusinessHoursService.invalidate() was written for exactly this call: the
 * policy is cached for a minute because it is read on every SLA calculation,
 * which would otherwise make an administrator's change appear not to work for
 * up to sixty seconds. The reference-number generator needs no equivalent
 * because it re-reads its setting on every submission.
 */
@CommandHandler(UpdateSettingCommand)
export class UpdateSettingHandler
  implements ICommandHandler<UpdateSettingCommand, SettingView>
{
  constructor(
    @Inject(SYSTEM_SETTING_REPOSITORY)
    private readonly settings: SystemSettingRepository,
    @Inject(ID_GENERATOR)
    private readonly ids: IdGenerator,
    private readonly businessHours: BusinessHoursService,
  ) {}

  async execute({
    key,
    value,
    userId,
    description,
  }: UpdateSettingCommand): Promise<SettingView> {
    const definition = settingDefinition(key)
    definition.validate(value)

    const actor = Identifier.of(userId)
    const existing = await this.settings.findByKey(definition.key)

    let setting: SystemSetting
    if (existing) {
      existing.update(value, actor)
      setting = existing
    } else {
      setting = SystemSetting.create(this.ids.next(), {
        key: definition.key,
        value,
        description: description ?? definition.description,
        updatedBy: actor,
      })
    }

    await this.settings.save(setting)

    if (definition.invalidatesWorkingHours) this.businessHours.invalidate()

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
