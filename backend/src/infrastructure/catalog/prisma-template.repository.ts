import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import { Template } from '../../domain/catalog/template'
import { TemplateRepository } from '../../domain/catalog/ports/template.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { TemplateMapper, templateInclude } from './template.mapper'

/**
 * Prisma-backed TemplateRepository. A template is an aggregate (root + fields +
 * options + eligibility rules), so reads always eager-load its children, and
 * save() rewrites the whole child set inside a single transaction so the stored
 * template mirrors the in-memory aggregate exactly (removed fields/rules do not
 * linger).
 */
@Injectable()
export class PrismaTemplateRepository implements TemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Template | null> {
    const row = await this.prisma.template.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
      include: templateInclude,
    })
    return row ? TemplateMapper.toDomain(row) : null
  }

  async listActive(): Promise<Template[]> {
    const rows = await this.prisma.template.findMany({
      where: { isActive: true, deletedAt: null },
      include: templateInclude,
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => TemplateMapper.toDomain(row))
  }

  async listByCategory(categoryId: Identifier): Promise<Template[]> {
    const rows = await this.prisma.template.findMany({
      where: { categoryId: BigInt(categoryId.toString()), deletedAt: null },
      include: templateInclude,
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => TemplateMapper.toDomain(row))
  }

  async save(template: Template): Promise<void> {
    const root = TemplateMapper.toRoot(template)
    const id = BigInt(template.id.toString())
    const snapshot = template.snapshot()

    await this.prisma.$transaction(async (tx) => {
      await tx.template.upsert({
        where: { id },
        create: root,
        update: root,
      })

      // Replace the child set. Deleting a field cascades to its options
      // (FK onDelete: Cascade); rules are deleted directly.
      await tx.templateField.deleteMany({ where: { templateId: id } })
      await tx.templateEligibilityRule.deleteMany({ where: { templateId: id } })

      for (const field of snapshot.fields) {
        await tx.templateField.create({
          data: {
            id: BigInt(field.id),
            templateId: id,
            fieldKey: field.fieldKey,
            label: field.label as Prisma.InputJsonValue,
            dataType: field.dataType,
            isRequired: field.isRequired,
            ordinal: field.ordinal,
            options: {
              create: field.options.map((option) => ({
                value: option.value,
                label: option.label as Prisma.InputJsonValue,
                ordinal: option.ordinal,
              })),
            },
          },
        })
      }

      for (const rule of snapshot.eligibilityRules) {
        await tx.templateEligibilityRule.create({
          data: {
            id: BigInt(rule.id),
            templateId: id,
            attributeId: BigInt(rule.attributeId),
            operator: rule.operator,
            value: rule.value as Prisma.InputJsonValue,
          },
        })
      }
    })
  }
}
