export interface NotificationAudiencePort {
    findUserIdsWithPermission(permissionCode: string): Promise<string[]>;
}
