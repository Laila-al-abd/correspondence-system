import { Language } from '../language';
export interface LanguageRepository {
    findByCode(code: string): Promise<Language | null>;
    list(): Promise<Language[]>;
    save(language: Language): Promise<void>;
}
