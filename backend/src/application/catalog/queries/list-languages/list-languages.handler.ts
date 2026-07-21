import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { LanguageRepository } from '../../../../domain/catalog/ports/language.repository'
import { LANGUAGE_REPOSITORY } from '../../../tokens'
import { ListLanguagesQuery } from './list-languages.query'
import { LanguageView } from './language.view'

@QueryHandler(ListLanguagesQuery)
export class ListLanguagesHandler
  implements IQueryHandler<ListLanguagesQuery, LanguageView[]>
{
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languages: LanguageRepository,
  ) {}

  async execute(query: ListLanguagesQuery): Promise<LanguageView[]> {
    const all = await this.languages.list()
    return all
      .filter((language) => !query.onlyEnabled || language.isEnabled)
      .map((language) => language.toJSON())
  }
}
