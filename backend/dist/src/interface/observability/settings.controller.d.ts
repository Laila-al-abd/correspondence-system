import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { SettingKeyView, SettingView } from '../../application/observability/queries/views/setting.view';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    listKeys(): SettingKeyView[];
    getOne(key: string): Promise<SettingView>;
    update(key: string, dto: UpdateSettingDto, userId: string): Promise<SettingView>;
}
