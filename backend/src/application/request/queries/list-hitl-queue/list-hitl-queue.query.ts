export class ListHitlQueueQuery {
  constructor(
    public readonly limit?: number,
    public readonly cursor?: string,
  ) {}

  static readonly status = 'DRAFT'
  static readonly classificationStatus: string[] = ['PENDING', 'HITL']
}