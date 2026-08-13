import { Prisma, SystemSetting as SystemSettingRow } from '../../../generated/prisma/client';
import { SystemSetting } from '../../domain/observability/system-setting';
export declare const SystemSettingMapper: {
    toDomain(row: SystemSettingRow): SystemSetting;
    toPersistence(setting: SystemSetting): Prisma.SystemSettingUncheckedCreateInput;
};
