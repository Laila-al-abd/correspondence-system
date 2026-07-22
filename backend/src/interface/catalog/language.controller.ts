import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreateLanguageCommand } from '../../application/catalog/commands/create-language/create-language.command'
import { ListLanguagesQuery } from '../../application/catalog/queries/list-languages/list-languages.query'
import { LanguageView } from '../../application/catalog/queries/list-languages/language.view'
import { CreateLanguageDto } from './dto/create-language.dto'

@Controller('languages')
export class LanguageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@Query('onlyEnabled') onlyEnabled?: string): Promise<LanguageView[]> {
    return this.queryBus.execute(new ListLanguagesQuery(onlyEnabled === 'true'))
  }

  @Post()
  async create(@Body() dto: CreateLanguageDto): Promise<{ code: string }> {
    const code = await this.commandBus.execute(new CreateLanguageCommand(dto))
    return { code }
  }
}
