import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { AttributeDefinitionRepository } from '../../domain/catalog/ports/attribute-definition.repository';
import { AttributeDefinition } from '../../domain/catalog/attribute-definition';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
import {
  AttributeDefinitionMapper,
  attributeInclude,
} from './attribute-definition.mapper';

/** Adapter for the attribute_definitions (ABAC vocabulary) table. */
@Injectable()
export class PrismaAttributeDefinitionRepository implements AttributeDefinitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<AttributeDefinition | null> {
    const row = await this.prisma.attributeDefinition.findFirst({
      where: { id: id.toString(), deletedAt: null },
      include: attributeInclude,
    });
    return row ? AttributeDefinitionMapper.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<AttributeDefinition | null> {
    const row = await this.prisma.attributeDefinition.findFirst({
      where: { code, deletedAt: null },
      include: attributeInclude,
    });
    return row ? AttributeDefinitionMapper.toDomain(row) : null;
  }

  async list(): Promise<AttributeDefinition[]> {
    const rows = await this.prisma.attributeDefinition.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
      include: attributeInclude,
    });
    return rows.map((row) => AttributeDefinitionMapper.toDomain(row));
  }

  /**
   * Writes the definition and its options in one transaction.
   *
   * The option rows are rewritten wholesale rather than diffed, mirroring how
   * PrismaTemplateRepository handles template-field options: the option set is
   * part of the definition, not an independently addressable thing. Stored user
   * values reference the definition, never an option row, so replacing options
   * cannot orphan a foreign key -- a value that is no longer in the option set
   * simply stops satisfying AttributeDefinition.validate, which is the intended
   * meaning of removing a choice.
   */
  async save(definition: AttributeDefinition): Promise<void> {
    const snapshot = definition.snapshot();
    const label = toJsonText(snapshot.label);
    const description =
      snapshot.description === undefined
        ? Prisma.DbNull
        : toJsonText(snapshot.description);

    await this.prisma.$transaction(async (tx) => {
      await tx.attributeDefinition.upsert({
        where: { id: snapshot.id },
        create: {
          id: snapshot.id,
          code: snapshot.code,
          label,
          dataType: snapshot.dataType,
          description,
        },
        update: {
          code: snapshot.code,
          label,
          dataType: snapshot.dataType,
          description,
          deletedAt: null,
        },
      });

      await tx.attributeOption.deleteMany({
        where: { attributeId: snapshot.id },
      });

      const options = definition.options;
      if (options.length > 0)
        await tx.attributeOption.createMany({
          data: options.map((option) => ({
            id: option.id.toString(),
            attributeId: snapshot.id,
            value: option.value,
            label: toJsonText(option.label.toJSON()),
            ordinal: option.ordinal,
          })),
        });
    });
  }
}

/**
 * LocalizedText.toJSON() may carry `en: undefined`, which Prisma's JSON input
 * type rejects. Dropping the key is also the shape the seed writes, so rows
 * created here are indistinguishable from seeded ones.
 */
function toJsonText(value: { ar: string; en?: string }): Prisma.InputJsonValue {
  return value.en ? { ar: value.ar, en: value.en } : { ar: value.ar };
}
