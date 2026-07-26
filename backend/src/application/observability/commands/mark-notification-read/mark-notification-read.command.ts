/**
 * Marks one notification as read. `userId` is the authenticated caller and is
 * used to prove ownership before the row is touched.
 */
export class MarkNotificationReadCommand {
  constructor(
    readonly notificationId: string,
    readonly userId: string,
  ) {}
}
