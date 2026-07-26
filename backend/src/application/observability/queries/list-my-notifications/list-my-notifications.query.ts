/**
 * Lists the caller's own notifications, newest first. The user id always comes
 * from the authenticated caller, never from the client, so one user can never
 * read another user's inbox.
 */
export class ListMyNotificationsQuery {
  constructor(
    readonly userId: string,
    readonly onlyUnread: boolean = false,
  ) {}
}
