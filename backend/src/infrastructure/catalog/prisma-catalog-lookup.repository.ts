import { Injectable } from '@nestjs/common'
import {
  SensitivityLevelRepository,
  RequestCategoryRepository,
  ActionTypeRepository,
} from '../../domain/catalog/ports/catalog-lookup.repository'
import { SensitivityLevel } from '../../domain/catalog/sensitivity-level'
import { RequestCategory } from '../../domain/catalog/request-category'
import { ActionType } from '../../domain/catalog/action-type'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import {
  SensitivityLevelMapper,
  RequestCategoryMapper,
  ActionTypeMapper,
} from './catalog-lookup.mapper'

/** Read-only adapter for the sensitivity_levels lookup table. */
@Injectable()
export class PrismaSensitivityLevelRepository
  implements SensitivityLevelRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<SensitivityLevel | null> {
    const row = await this.prisma.sensitivityLevel.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? SensitivityLevelMapper.toDomain(row) : null
  }

  async list(): Promise<SensitivityLevel[]> {
    const rows = await this.prisma.sensitivityLevel.findMany({
      where: { deletedAt: null },
      orderBy: { rank: 'asc' },
    })
    return rows.map((row) => SensitivityLevelMapper.toDomain(row))
  }
}

/** Read-only adapter for the request_categories lookup table. */
@Injectable()
export class PrismaRequestCategoryRepository
  implements RequestCategoryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<RequestCategory | null> {
    const row = await this.prisma.requestCategory.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? RequestCategoryMapper.toDomain(row) : null
  }

  async list(): Promise<RequestCategory[]> {
    const rows = await this.prisma.requestCategory.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => RequestCategoryMapper.toDomain(row))
  }
}

/** Read-only adapter for the action_types lookup table. */
@Injectable()
export class PrismaActionTypeRepository implements ActionTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<ActionType | null> {
    const row = await this.prisma.actionType.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? ActionTypeMapper.toDomain(row) : null
  }

  async findByCode(code: string): Promise<ActionType | null> {
    const row = await this.prisma.actionType.findFirst({
      where: { code, deletedAt: null },
    })
    return row ? ActionTypeMapper.toDomain(row) : null
  }

  async list(): Promise<ActionType[]> {
    const rows = await this.prisma.actionType.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    })
    return rows.map((row) => ActionTypeMapper.toDomain(row))
  }
}
