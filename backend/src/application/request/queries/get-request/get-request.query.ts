export class GetRequestQuery {
  constructor(
    public readonly requestId: string,
    /** The caller, so the handler can tell an owner from a member of staff. */
    public readonly requestedBy: string,
  ) {}
}
