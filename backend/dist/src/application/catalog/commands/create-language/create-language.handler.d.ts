import { ICommandHandler } from '@nestjs/cqrs';
import type { LanguageRepository } from '../../../../domain/catalog/ports/language.repository';
import { CreateLanguageCommand } from './create-language.command';
export declare class CreateLanguageHandler implements ICommandHandler<CreateLanguageCommand, string> {
    private readonly languages;
    constructor(languages: LanguageRepository);
    execute({ input }: CreateLanguageCommand): Promise<string>;
}
