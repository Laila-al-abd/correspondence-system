export class CheckTemplateEligibilityQuery {
  constructor(
    public readonly userId: string,
    public readonly templateId: string,
  ) {}
}
