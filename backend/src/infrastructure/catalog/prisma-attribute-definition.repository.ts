import { Injectable } from '@nestjs/common'
import { AttributeDefinitionRepository } from '../../domain/catalog/ports/attribute-definition.repository'
import { AttributeDefinition } from '../../domain/catalog/attribute-definition'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { AttributeDefinitionMapper } from './attribute-definition.mapper'

/** Read-only adapter for the attribute_definitions (ABAC vocabulary) table. */
@Injectable()
export class PrismaAttributeDefinitionRepository
  implements AttributeDefinitionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<AttributeDefinition | null> {
    const row = await this.prisma.attributeDefinition.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? AttributeDefinitionMapper.toDomain(row) : null
  }

  async findByCode(code: string): Promise<AttributeDefinition | null> {
    const row = await this.prisma.attributeDefinition.findFirst({
      where: { code, deletedAt: null },
    })
    return row ? AttributeDefinitionMapper.toDomain(row) : null
  }

  async list(): Promise<AttributeDefinition[]> {
    const rows = await this.prisma.attributeDefinition.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    })
    return rows.map((row) => AttributeDefinitionMapper.toDomain(row))
  }
}
