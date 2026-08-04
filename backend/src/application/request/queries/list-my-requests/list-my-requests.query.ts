export class ListMyRequestsQuery {
  constructor(
    public readonly requesterId: string,
    public readonly limit?: number,
    public readonly cursor?: string,
  ) {}
}
