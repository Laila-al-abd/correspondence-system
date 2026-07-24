import {
  Prisma,
  SystemSetting as SystemSettingRow,
} from '../../../generated/prisma/client'
import { SystemSetting } from '../../domain/observability/system-setting'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the SystemSetting aggregate and the `system_settings` row. */
export const SystemSettingMapper = {
  toDomain(row: SystemSettingRow): SystemSetting {
    return SystemSetting.rehydrate(Identifier.of(row.id), {
      key: row.key,
      value: row.value,
      description: row.description ?? undefined,
      updatedBy:
        row.updatedBy != null ? Identifier.of(row.updatedBy) : undefined,
      updatedAt: row.updatedAt,
    })
  },

  toPersistence(
    setting: SystemSetting,
  ): Prisma.SystemSettingUncheckedCreateInput {
    const s = setting.snapshot()
    return {
      id: BigInt(setting.id.toString()),
      key: s.key,
      value: s.value as Prisma.InputJsonValue,
      description: s.description ?? null,
      updatedBy: s.updatedBy ? BigInt(s.updatedBy) : null,
      updatedAt: s.updatedAt,
    }
  },
}
