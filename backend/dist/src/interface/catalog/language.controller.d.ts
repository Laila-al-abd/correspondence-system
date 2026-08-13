import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LanguageView } from '../../application/catalog/queries/list-languages/language.view';
import { CreateLanguageDto } from './dto/create-language.dto';
export declare class LanguageController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    list(onlyEnabled?: string): Promise<LanguageView[]>;
    create(dto: CreateLanguageDto): Promise<{
        code: string;
    }>;
}
