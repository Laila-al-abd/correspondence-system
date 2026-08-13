import { SystemSetting } from '../../domain/observability/system-setting';
import { SystemSettingRepository } from '../../domain/observability/ports/system-setting.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaSystemSettingRepository implements SystemSettingRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<SystemSetting | null>;
    findByKey(key: string): Promise<SystemSetting | null>;
    save(setting: SystemSetting): Promise<void>;
}
