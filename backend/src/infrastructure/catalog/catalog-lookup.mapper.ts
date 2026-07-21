import type {
  SensitivityLevel as SensitivityLevelRow,
  RequestCategory as RequestCategoryRow,
  ActionType as ActionTypeRow,
  Prisma,
} from '../../../generated/prisma/client'
import { SensitivityLevel } from '../../domain/catalog/sensitivity-level'
import { RequestCategory } from '../../domain/catalog/request-category'
import { ActionType } from '../../domain/catalog/action-type'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'

type Bilingual = { ar: string; en?: string }

const toLocalized = (json: Prisma.JsonValue): LocalizedText => {
  const value = json as unknown as Bilingual
  return LocalizedText.create(value.ar, value.en)
}

/** Lookup mappers for the small, mostly-static catalog reference tables. */
export const SensitivityLevelMapper = {
  toDomain(row: SensitivityLevelRow): SensitivityLevel {
    return SensitivityLevel.rehydrate(Identifier.of(row.id), {
      name: toLocalized(row.name),
      rank: row.rank,
      description: row.description ? toLocalized(row.description) : undefined,
    })
  },
}

export const RequestCategoryMapper = {
  toDomain(row: RequestCategoryRow): RequestCategory {
    return RequestCategory.rehydrate(Identifier.of(row.id), {
      name: toLocalized(row.name),
      description: row.description ? toLocalized(row.description) : undefined,
    })
  },
}

export const ActionTypeMapper = {
  toDomain(row: ActionTypeRow): ActionType {
    return ActionType.rehydrate(Identifier.of(row.id), {
      code: row.code,
      name: toLocalized(row.name),
      isTerminal: row.isTerminal,
    })
  },
}
