import { Injectable } from '@nestjs/common'
import type { Request } from '../../../domain/request/request'
import type { Template } from '../../../domain/catalog/template'
import { EvaluateEligibility } from '../../access/evaluate-eligibility'
import { FilledDataInvalidError, NotEligibleError } from '../../errors'

/**
 * The two checks that must pass before a request may be bound to a template.
 *
 * Both rules already existed and neither was ever enforced. The ABAC engine
 * could say whether a user was eligible, but nothing asked it on the write
 * path, so eligibility was advisory. `Template.validateFilledData` could check
 * a submission against the template's declared fields, and had no callers at
 * all, so `filled_data` was whatever JSON happened to arrive.
 *
 * They are enforced here, at classification, because that is the moment the
 * template becomes known. A request submitted as free text has no template at
 * submit time, so there is nothing to check against until it is classified --
 * checking earlier would either crash on an undefined template or let every
 * unclassified request through.
 *
 * Kept as one service rather than copied into both classify handlers, so the
 * automatic and human paths cannot drift apart. A rule enforced in one of two
 * places is not enforced.
 */
@Injectable()
export class TemplateSubmissionPolicy {
  constructor(private readonly eligibility: EvaluateEligibility) {}

  /**
   * Throws unless the requester is eligible for this template and any form
   * data they supplied matches it. Reports every problem at once, so a
   * requester fixes their submission in one pass rather than one field per
   * attempt.
   */
  async assertMayBeClassifiedAs(
    request: Request,
    template: Template,
  ): Promise<void> {
    const verdict = await this.eligibility.evaluate(
      request.requesterId,
      template,
    )
    if (!verdict.eligible) throw new NotEligibleError(verdict.unmetRules)

    const filledData = request.filledData
    if (!filledData) return

    const violations = template.validateFilledData(filledData)
    if (violations.length > 0) throw new FilledDataInvalidError(violations)
  }
}
