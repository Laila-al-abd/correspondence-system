export class ListStepCandidatesQuery {
  constructor(
    public readonly requestId: string,
    public readonly stepInstanceId: string,
  ) {}
}
