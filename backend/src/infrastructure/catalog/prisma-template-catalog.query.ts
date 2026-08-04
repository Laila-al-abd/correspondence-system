import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import { TemplateCatalogQueryPort } from '../../application/catalog/queries/ports/template-catalog.query'
import {
  TemplateCatalogView,
  TemplateFieldCatalogView,
} from '../../application/catalog/queries/views/template-catalog.view'
import { PrismaService } from '../persistence/prisma.service'

const catalogInclude = {
  fields: { include: { options: true } },
} satisfies Prisma.TemplateInclude

type CatalogRow = Prisma.TemplateGetPayload<{ include: typeof catalogInclude }>

type Bilingual = { ar?: string; en?: string }

const text = (json: Prisma.JsonValue | null): Bilingual =>
  (json ?? {}) as unknown as Bilingual

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Prisma projection of the template catalogue. */
@Injectable()
export class PrismaTemplateCatalogQuery implements TemplateCatalogQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter?: { onlyActive?: boolean }): Promise<TemplateCatalogView[]> {
    const rows = await this.prisma.template.findMany({
      where: {
        deletedAt: null,
        ...(filter?.onlyActive === false ? {} : { isActive: true }),
      },
      include: catalogInclude,
      orderBy: [{ code: 'asc' }, { id: 'asc' }],
    })
    return rows.map((row) => this.toView(row))
  }

  async findByIdOrCode(idOrCode: string): Promise<TemplateCatalogView | null> {
    const key = idOrCode.trim()
    const row = await this.prisma.template.findFirst({
      where: {
        deletedAt: null,
        ...(UUID.test(key)
          ? { id: key }
          : { code: key.toUpperCase() }),
      },
      include: catalogInclude,
    })
    return row ? this.toView(row) : null
  }

  private toView(row: CatalogRow): TemplateCatalogView {
    const title = text(row.title)
    const description = text(row.description)
    const fields: TemplateFieldCatalogView[] = [...row.fields]
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((field) => {
        const label = text(field.label)
        return {
          key: field.fieldKey,
          labelAr: label.ar ?? field.fieldKey,
          labelEn: label.en,
          dataType: field.dataType,
          isRequired: field.isRequired,
          ordinal: field.ordinal,
          extractionQuestion: field.extractionQuestion ?? undefined,
          options: [...field.options]
            .sort((a, b) => a.ordinal - b.ordinal)
            .map((option) => {
              const optionLabel = text(option.label)
              return {
                value: option.value,
                labelAr: optionLabel.ar ?? option.value,
                labelEn: optionLabel.en,
              }
            }),
        }
      })

    return {
      id: row.id,
      code: row.code ?? undefined,
      nameAr: title.ar ?? '',
      nameEn: title.en,
      descriptionAr: description.ar,
      descriptionEn: description.en,
      // No authored document means the description is what gets embedded, so an
      // admin-added template classifies with no further work.
      classifierDocument: row.classifierDocument ?? description.ar,
      categoryId: row.categoryId,
      sensitivityLevelId: row.sensitivityLevelId,
      isActive: row.isActive,
      updatedAt: row.updatedAt.toISOString(),
      fields,
    }
  }
}
