/**
 * Read-side port for the SLA monitor.
 *
 * The monitor needs the cheapest possible answer to one question: which open
 * step instances have a deadline attached? Loading whole request aggregates to
 * find that out would pull far too much data, so this port returns flat rows
 * and the monitor loads only the aggregates it actually has to change.
 */

export interface OpenStepSla {
  requestId: string
  stepInstanceId: string
  slaDueAt: Date
}

export interface SlaScanPort {
  /**
   * Open (non-terminal, non-paused) step instances that carry a deadline,
   * tightest deadline first. `limit` caps the work of a single sweep so one
   * pass can never turn into a long-running table scan.
   */
  findOpenStepsWithDeadline(limit: number): Promise<OpenStepSla[]>
}
