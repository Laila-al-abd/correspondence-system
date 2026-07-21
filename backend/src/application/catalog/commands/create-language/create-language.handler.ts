import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Language } from '../../../../domain/catalog/language'
import type { LanguageRepository } from '../../../../domain/catalog/ports/language.repository'
import { LANGUAGE_REPOSITORY } from '../../../tokens'
import { LanguageAlreadyExistsError } from '../../../errors'
import { CreateLanguageCommand } from './create-language.command'

@CommandHandler(CreateLanguageCommand)
export class CreateLanguageHandler
  implements ICommandHandler<CreateLanguageCommand, string>
{
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languages: LanguageRepository,
  ) {}

  async execute({ input }: CreateLanguageCommand): Promise<string> {
    const code = input.code.trim().toLowerCase()
    if (await this.languages.findByCode(code)) {
      throw new LanguageAlreadyExistsError(code)
    }
    const language = Language.create(input)
    await this.languages.save(language)
    return language.code
  }
}
