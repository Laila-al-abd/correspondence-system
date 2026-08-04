import { KeysetPage } from '../../shared/pagination'
import {
  DurationEstimateView,
  RequestSummaryView,
} from '../queries/views/request.view'

/**
 * Read-side port for the request context, mirroring UserQueryPort in identity.
 *
 * It exists because the list endpoints were reading through RequestRepository,
 * the write-side port. That repository loads whole aggregates -- every step
 * instance, action, document and payment of every request -- which the caller
 * then threw away to render a fourteen-field summary. On /requests/queue that
 * meant pulling the entire graph of every open request in the institute in
 * order to draw a table of reference numbers.
 *
 * Paging the repository would have fixed the volume but kept the shape wrong,
 * and would have pushed a presentation concern (page size, cursors) into a
 * domain port whose job is to hand back consistent aggregates. So the read side
 * gets its own port: flat views, selected columns, paging where it belongs.
 * The write side keeps loading whole aggregates, because commands need them.
 */

export interface ListRequestsByRequesterInput {
  requesterId: string
  limit?: number
  cursor?: string
}

export interface ListRequestsAssignedInput {
  userId: string
  limit?: number
  cursor?: string
}

export interface ListRequestQueueInput {
  status: string
  limit?: number
  cursor?: string
  /** PENDING | CLASSIFIED | HITL. Omitted means every classification state. */
  classificationStatus?: string
  /** true = only requests with form data; false = only those still empty. */
  hasFilledData?: boolean
}

/**
 * Fewest completed requests a median may be drawn from.
 *
 * A median over two rows is not a typical duration, it is a coincidence, and
 * presenting it as "requests like this usually take" would be a claim the data
 * cannot support. Below this many the declared budget is reported instead -- a
 * promise rather than a measurement, which is the honest thing to have when
 * there is no history yet.
 */
export const MIN_DURATION_SAMPLE_SIZE = 5

export interface RequestQueryPort {
  /** The caller's own requests, newest first. */
  listByRequester(
    input: ListRequestsByRequesterInput,
  ): Promise<KeysetPage<RequestSummaryView>>

  /** Requests with at least one step assigned to the caller, newest first. */
  listAssignedTo(
    input: ListRequestsAssignedInput,
  ): Promise<KeysetPage<RequestSummaryView>>

  /**
   * The work queue for a status, in the order staff should pick items up:
   * priority, then SLA risk, then nearest deadline -- the same order
   * Request.compareForQueue defines, evaluated by the database.
   */
  listQueue(
    input: ListRequestQueueInput,
  ): Promise<KeysetPage<RequestSummaryView>>

  /**
   * How long requests of one template take, as a median over completed ones,
   * falling back to the workflow's declared SLA budget while the history is too
   * thin to speak for itself.
   *
   * Per template, never across all of them: a transcript and a study withdrawal
   * share nothing but a table, and one figure spanning both would describe
   * neither. Median rather than mean, because a single request that sat
   * forgotten for three weeks moves a mean and does not move a median -- and
   * "half of them finish faster than this" is the sentence people actually want.
   *
   * Undefined when the template has no history and no declared budget.
   */
  estimateDuration(templateId: string): Promise<DurationEstimateView | undefined>
}
