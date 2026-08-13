import { IQueryHandler } from '@nestjs/cqrs';
import type { SystemSettingRepository } from '../../../../domain/observability/ports/system-setting.repository';
import { SettingView } from '../views/setting.view';
import { GetSettingQuery } from './get-setting.query';
export declare class GetSettingHandler implements IQueryHandler<GetSettingQuery, SettingView> {
    private readonly settings;
    constructor(settings: SystemSettingRepository);
    execute({ key }: GetSettingQuery): Promise<SettingView>;
}
