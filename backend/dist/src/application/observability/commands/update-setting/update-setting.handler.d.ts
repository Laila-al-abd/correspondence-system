import { ICommandHandler } from '@nestjs/cqrs';
import type { SystemSettingRepository } from '../../../../domain/observability/ports/system-setting.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { BusinessHoursService } from '../../services/business-hours.service';
import { SettingView } from '../../queries/views/setting.view';
import { UpdateSettingCommand } from './update-setting.command';
export declare class UpdateSettingHandler implements ICommandHandler<UpdateSettingCommand, SettingView> {
    private readonly settings;
    private readonly ids;
    private readonly businessHours;
    constructor(settings: SystemSettingRepository, ids: IdGenerator, businessHours: BusinessHoursService);
    execute({ key, value, userId, description, }: UpdateSettingCommand): Promise<SettingView>;
}
