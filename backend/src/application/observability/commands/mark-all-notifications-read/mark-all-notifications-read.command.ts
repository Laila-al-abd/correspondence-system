/** Clears the caller's unread badge in one call. */
export class MarkAllNotificationsReadCommand {
  constructor(readonly userId: string) {}
}
