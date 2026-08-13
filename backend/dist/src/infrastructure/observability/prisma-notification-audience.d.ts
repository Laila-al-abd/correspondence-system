import type { NotificationAudiencePort } from '../../application/observability/ports/notification-audience.port';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaNotificationAudience implements NotificationAudiencePort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUserIdsWithPermission(permissionCode: string): Promise<string[]>;
}
