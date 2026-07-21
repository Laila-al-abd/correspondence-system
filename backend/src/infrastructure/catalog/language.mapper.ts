import { Language } from '../../domain/catalog/language'
import type { Language as LanguageRow } from '../../../generated/prisma/client'

/**
 * Translates between the Language domain model and the Prisma `languages` row.
 * One mapper per aggregate keeps persistence concerns at the infra boundary.
 */
export const LanguageMapper = {
  toDomain(row: LanguageRow): Language {
    return Language.rehydrate({
      code: row.code,
      name: row.name,
      nativeName: row.nativeName,
      isEnabled: row.isEnabled,
      isDefault: row.isDefault,
    })
  },

  toPersistence(language: Language): {
    code: string
    name: string
    nativeName: string
    isEnabled: boolean
    isDefault: boolean
  } {
    const props = language.toJSON()
    return {
      code: props.code,
      name: props.name,
      nativeName: props.nativeName,
      isEnabled: props.isEnabled,
      isDefault: props.isDefault,
    }
  },
}
