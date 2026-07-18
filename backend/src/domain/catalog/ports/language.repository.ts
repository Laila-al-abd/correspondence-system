import { Language } from '../language'

/**
 * Port for Language persistence. A simple context does not need the generic
 * `Repository<AggregateRoot>` base — a focused interface is clearer.
 */
export interface LanguageRepository {
  findByCode(code: string): Promise<Language | null>
  list(): Promise<Language[]>
  save(language: Language): Promise<void>
}
