export class ListRequestQueueQuery {
  constructor(
    public readonly status: string,
    public readonly limit?: number,
    public readonly cursor?: string,
    public readonly classificationStatus?: string,
    public readonly hasFilledData?: boolean,
    public readonly extracted?: boolean,
  ) {}
}
