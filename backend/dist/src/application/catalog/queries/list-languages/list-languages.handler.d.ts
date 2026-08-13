import { IQueryHandler } from '@nestjs/cqrs';
import type { LanguageRepository } from '../../../../domain/catalog/ports/language.repository';
import { ListLanguagesQuery } from './list-languages.query';
import { LanguageView } from './language.view';
export declare class ListLanguagesHandler implements IQueryHandler<ListLanguagesQuery, LanguageView[]> {
    private readonly languages;
    constructor(languages: LanguageRepository);
    execute(query: ListLanguagesQuery): Promise<LanguageView[]>;
}
