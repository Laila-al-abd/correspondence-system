import { Language } from '../../domain/catalog/language';
import type { Language as LanguageRow } from '../../../generated/prisma/client';
export declare const LanguageMapper: {
    toDomain(row: LanguageRow): Language;
    toPersistence(language: Language): {
        code: string;
        name: string;
        nativeName: string;
        isEnabled: boolean;
        isDefault: boolean;
    };
};
