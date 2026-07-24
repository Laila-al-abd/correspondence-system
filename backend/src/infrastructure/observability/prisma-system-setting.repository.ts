import { Injectable } from '@nestjs/common'
import { SystemSetting } from '../../domain/observability/system-setting'
import { SystemSettingRepository } from '../../domain/observability/ports/system-setting.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { SystemSettingMapper } from './system-setting.mapper'

/**
 * Prisma-backed SystemSettingRepository over the `system_settings` table.
 * Settings are addressed by a unique string key (e.g. the classification
 * threshold or the request-number format).
 */
@Injectable()
export class PrismaSystemSettingRepository implements SystemSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<SystemSetting | null> {
    const row = await this.prisma.systemSetting.findFirst({
      where: { id: BigInt(id.toString()) },
    })
    return row ? SystemSettingMapper.toDomain(row) : null
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    const row = await this.prisma.systemSetting.findFirst({ where: { key } })
    return row ? SystemSettingMapper.toDomain(row) : null
  }

  async save(setting: SystemSetting): Promise<void> {
    const data = SystemSettingMapper.toPersistence(setting)
    await this.prisma.systemSetting.upsert({
      where: { id: BigInt(setting.id.toString()) },
      create: data,
      update: data,
    })
  }
}
