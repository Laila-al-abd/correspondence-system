export class ListAssignedRequestsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly cursor?: string,
  ) {}
}
