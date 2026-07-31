import { Inject, Injectable, Logger } from '@nestjs/common'
import { MlPrediction } from '../../../domain/observability/ml-prediction'
import { ModelType } from '../../../domain/observability/enums'
import type { MlPredictionRepository } from '../../../domain/observability/ports/ml-prediction.repository'
import type { SystemSettingRepository } from '../../../domain/observability/ports/system-setting.repository'
import type { RequestRepository } from '../../../domain/request/ports/request.repository'
import { SLA_RISK_RANK, SlaRisk } from '../../../domain/request/enums'
import type { IdGenerator } from '../../../domain/shared/id-generator'
import { Identifier } from '../../../domain/shared/identifier'
import {
  ID_GENERATOR,
  ML_PREDICTION_REPOSITORY,
  REQUEST_REPOSITORY,
  SLA_SCAN,
  SYSTEM_SETTING_REPOSITORY,
} from '../../tokens'
import type { SlaScanPort } from '../ports/sla-scan.port'
import { BusinessHoursService } from './business-hours.service'

/** system_settings key holding the risk thresholds. */
export const SLA_THRESHOLD_SETTING_KEY = 'sla_thresholds'

/** Working hours of remaining time below which a step counts as at risk. */
const DEFAULT_AT_RISK_HOURS = 8

/** Most steps a single sweep will look at. */
export const DEFAULT_SCAN_LIMIT = 500

/**
 * Version stamp written to `ml_predictions`. The LSTM will write to the same
 * table under its own version, which is what makes the two comparable.
 */
export const BASELINE_MODEL_VERSION = 'baseline-rule-v1'

export interface SlaSweepResult {
  scannedSteps: number
  requestsChanged: number
  breached: number
  atRisk: number
  onTrack: number
}

interface RequestVerdict {
  risk: SlaRisk
  /** Remaining working hours on the tightest open step (negative if overdue). */
  remainingHours: number
}

/**
 * The baseline SLA monitor.
 *
 * Until now `requests.sla_risk` was a column nothing ever wrote and
 * `request_step_instances.sla_due_at` was a deadline nobody ever checked. This
 * service makes both of them live.
 *
 * Three decisions worth defending:
 *
 * 1. **Remaining time is counted in working hours, not clock hours.** A step
 *    that falls due on Thursday afternoon is not late on Friday morning,
 *    because Friday is not a working day here. Wall-clock arithmetic would
 *    flag every weekend as a failure and make the breach numbers meaningless.
 *
 * 2. **A request's risk is the worst state among its open steps.** Risk is a
 *    property of the request as a whole, and one late step makes the whole
 *    request late. Equally, when that step is finished the request must fall
 *    back to ON_TRACK -- risk has to be able to go down, not only up.
 *
 * 3. **Every verdict that changes something is recorded to `ml_predictions`**
 *    under a fixed model version. That gives the LSTM a published baseline to
 *    be measured against, instead of an accuracy number with nothing behind it.
 */
@Injectable()
export class SlaMonitorService {
  private readonly logger = new Logger(SlaMonitorService.name)

  constructor(
    @Inject(SLA_SCAN) private readonly scan: SlaScanPort,
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(SYSTEM_SETTING_REPOSITORY)
    private readonly settings: SystemSettingRepository,
    @Inject(ML_PREDICTION_REPOSITORY)
    private readonly predictions: MlPredictionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    private readonly businessHours: BusinessHoursService,
  ) {}

  /**
   * Runs one pass over the open steps and reconciles every affected request's
   * risk flag. Safe to run repeatedly: it is a pure recomputation, so running
   * it twice in a row gives the same answer and writes nothing the second time.
   */
  async sweep(): Promise<SlaSweepResult> {
    const now = new Date()
    const atRiskHours = await this.atRiskHours()
    const steps = await this.scan.findOpenStepsWithDeadline(DEFAULT_SCAN_LIMIT)

    // Collapse the step rows into one verdict per request.
    const verdicts = new Map<string, RequestVerdict>()
    for (const step of steps) {
      const overdue = step.slaDueAt.getTime() <= now.getTime()
      // workingHoursBetween returns 0 when the end is not after the start, so
      // "overdue" is decided on the raw instants and the size of the overrun is
      // measured backwards from the deadline.
      const remainingHours = overdue
        ? -(await this.businessHours.workingHoursBetween(step.slaDueAt, now))
        : await this.businessHours.workingHoursBetween(now, step.slaDueAt)

      const risk = overdue
        ? SlaRisk.BREACHED
        : remainingHours <= atRiskHours
          ? SlaRisk.AT_RISK
          : SlaRisk.ON_TRACK

      // Worst risk wins; the reported remaining time is the tightest step's.
      const previous = verdicts.get(step.requestId)
      verdicts.set(step.requestId, {
        risk:
          previous === undefined ||
          SLA_RISK_RANK[risk] > SLA_RISK_RANK[previous.risk]
            ? risk
            : previous.risk,
        remainingHours:
          previous === undefined
            ? remainingHours
            : Math.min(remainingHours, previous.remainingHours),
      })
    }

    const result: SlaSweepResult = {
      scannedSteps: steps.length,
      requestsChanged: 0,
      breached: 0,
      atRisk: 0,
      onTrack: 0,
    }

    for (const [requestId, verdict] of verdicts) {
      if (verdict.risk === SlaRisk.BREACHED) result.breached++
      else if (verdict.risk === SlaRisk.AT_RISK) result.atRisk++
      else result.onTrack++

      if (await this.applyTo(requestId, verdict, atRiskHours))
        result.requestsChanged++
    }

    return result
  }

  /**
   * Writes one request's verdict. Returns whether anything actually changed --
   * an unchanged request is left completely alone, so a sweep over a quiet
   * system performs no writes at all.
   */
  private async applyTo(
    requestId: string,
    verdict: RequestVerdict,
    atRiskHours: number,
  ): Promise<boolean> {
    try {
      const request = await this.requests.findById(Identifier.of(requestId))
      if (!request) return false
      if (request.slaRisk === verdict.risk) return false

      if (verdict.risk === SlaRisk.BREACHED) request.markBreached()
      else if (verdict.risk === SlaRisk.AT_RISK) request.markAtRisk()
      else request.clearSlaRisk()

      await this.requests.save(request)
      await this.record(requestId, verdict, atRiskHours)
      return true
    } catch (error) {
      // One bad request must not abort the sweep for everything behind it.
      this.logger.warn(
        `Could not update the SLA risk of request ${requestId}: ${describe(error)}`,
      )
      return false
    }
  }

  /**
   * Stores the reasoning behind a verdict. Written only when the risk actually
   * moves, which keeps the table a log of transitions rather than a fresh row
   * per request per sweep.
   */
  private async record(
    requestId: string,
    verdict: RequestVerdict,
    atRiskHours: number,
  ): Promise<void> {
    try {
      await this.predictions.save(
        MlPrediction.create(this.ids.next(), {
          requestId: Identifier.of(requestId),
          modelType: ModelType.LSTM_REMAINING_TIME,
          modelVersion: BASELINE_MODEL_VERSION,
          predictedValue: {
            risk: verdict.risk,
            remainingBusinessHours: round(verdict.remainingHours),
            atRiskThresholdHours: atRiskHours,
            basis: 'business-hours-countdown',
          },
        }),
      )
    } catch (error) {
      // The prediction row is an audit aid, not the outcome. Losing it must
      // never undo the risk flag we just wrote.
      this.logger.warn(
        `Could not record the SLA baseline for request ${requestId}: ${describe(error)}`,
      )
    }
  }

  /** Reads the at-risk threshold from system_settings, falling back to 8h. */
  private async atRiskHours(): Promise<number> {
    try {
      const setting = await this.settings.findByKey(SLA_THRESHOLD_SETTING_KEY)
      const value = setting?.value
      if (value && typeof value === 'object') {
        const raw = (value as Record<string, unknown>).atRiskHours
        const hours = Number(raw)
        if (Number.isFinite(hours) && hours > 0) return hours
      }
    } catch (error) {
      this.logger.warn(
        `Could not read ${SLA_THRESHOLD_SETTING_KEY}, using the default: ${describe(error)}`,
      )
    }
    return DEFAULT_AT_RISK_HOURS
  }
}

function round(hours: number): number {
  return Math.round(hours * 100) / 100
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
