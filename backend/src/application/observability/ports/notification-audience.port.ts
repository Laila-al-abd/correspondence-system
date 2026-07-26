/**
 * Read-side port for working out *who* should hear about a system-wide event.
 *
 * Most notifications have an obvious recipient (the requester, the assignee).
 * Some do not: when a classification drops into the human-in-the-loop queue
 * there is no single owner yet, so the emitter asks for everyone who is allowed
 * to act on requests. Keeping this behind a port means the emitter never has to
 * know how roles and permissions are stored.
 */
export interface NotificationAudiencePort {
  /**
   * User ids that hold `permissionCode` through any role assignment that has
   * not expired. Returns each user once.
   */
  findUserIdsWithPermission(permissionCode: string): Promise<string[]>
}
