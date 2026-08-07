import {
  ClassificationStatus,
  RequestStatus,
} from '../../../../domain/request/enums'

/**
 * The single word a client needs to render a request's badge.
 *
 * Three stored values describe where a request stands -- currentStatus,
 * classificationStatus and confirmedAt -- and each of them answers a different
 * question well. What no one of them answers is the question a user actually
 * asks: what is happening to my request right now? A request that has just been
 * submitted, one sitting in the human review queue, and one waiting for its
 * requester to confirm are all DRAFT + something, and "Draft" is a lie for all
 * three.
 *
 * Deliberately derived rather than stored. A fourth column would have to be
 * written by classifyByModel, classifyByHuman, applyExtractedFields, confirm,
 * dispute and startWorkflow, and the first one that forgot would leave a badge
 * telling the user something untrue with no way to detect it. Computed here,
 * the answer cannot drift from the facts it is computed from, and it needed no
 * migration.
 */
export type RequestStage =
  | 'AWAITING_CLASSIFICATION'
  | 'IN_HUMAN_REVIEW'
  | 'AWAITING_CONFIRMATION'
  | 'READY_TO_START'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'

export interface RequestStageInput {
  currentStatus: string
  classificationStatus: string
  confirmedAt?: Date | string | null
}

/**
 * Once a request is out of DRAFT its lifecycle status *is* the stage, so those
 * names are passed through unchanged. Everything interesting happens inside
 * DRAFT, where the classification tells us which of the three waiting rooms the
 * request is sitting in:
 *
 *  - PENDING    -> nobody has decided what it is yet (the classifier is next)
 *  - HITL       -> a person is deciding, either because confidence was low or
 *                  because the requester disputed what was proposed
 *  - CLASSIFIED -> the proposal is ready; whether it is waiting for the
 *                  requester or waiting to start depends on the confirmation
 */
export function deriveRequestStage(input: RequestStageInput): RequestStage {
  if (input.currentStatus !== RequestStatus.DRAFT)
    return input.currentStatus as RequestStage

  switch (input.classificationStatus) {
    case ClassificationStatus.HITL:
      return 'IN_HUMAN_REVIEW'
    case ClassificationStatus.CLASSIFIED:
      return input.confirmedAt ? 'READY_TO_START' : 'AWAITING_CONFIRMATION'
    default:
      return 'AWAITING_CLASSIFICATION'
  }
}

/**
 * The stage of a live aggregate, for callers holding the Request itself.
 *
 * Structurally typed rather than taking a Request, so the audit trail and the
 * read models can name a stage exactly the same way without this file learning
 * about the request aggregate. Same function underneath: if the two ever
 * disagreed, the badge a user sees and the history they are shown would tell
 * two different stories about the same request.
 */
export function stageOfRequest(request: {
  status: string
  classificationStatus: string
  confirmedAt?: Date
}): RequestStage {
  return deriveRequestStage({
    currentStatus: request.status,
    classificationStatus: request.classificationStatus,
    confirmedAt: request.confirmedAt,
  })
}
