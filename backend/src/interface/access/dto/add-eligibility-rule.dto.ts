import { Allow, IsIn, IsString, Length } from 'class-validator'

/** Body for POST /access/templates/:templateId/eligibility-rules. */
export class AddEligibilityRuleDto {
  @IsString()
  @Length(1, 100)
  attributeCode!: string

  @IsIn(['EQ', 'NEQ', 'IN', 'GTE', 'LTE'])
  operator!: string

  // Arbitrary JSON, compared per-operator in the handler. @Allow keeps it past
  // the global whitelisting ValidationPipe (which strips undecorated fields).
  @Allow()
  value!: unknown
}
