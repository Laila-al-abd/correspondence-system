import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RequestAction } from '../../../../domain/request/request-action'
import { Identifier } from '../../../../domain/shared/identifier'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository'
import {
  ACTION_TYPE_REPOSITORY,
  ID_GENERATOR,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { EventRecorder } from '../../../observability/services/event-recorder'
import {
  PaymentSettlement,
  SettlePaymentCommand,
} from './settle-payment.command'

/** Seeded action types the two outcomes file themselves as. */
const ACTION_CODE: Record<PaymentSettlement, string> = {
  [PaymentSettlement.CONFIRM]: 'CONFIRM_PAYMENT',
  [PaymentSettlement.WAIVE]: 'WAIVE_PAYMENT',
}

export interface SettlePaymentResult {
  id: string
  status: string
  settledAt?: string
}

/**
 * Confirms or waives one fee, and files the decision in the request trail.
 *
 * Both halves commit together. A confirmed payment with no action row beside it
 * is money the system says arrived with nobody attached to the claim, and a
 * waiver with no row is an exemption that never happened -- either way the step
 * unblocks and the trail cannot say why.
 *
 * The aggregate refuses a second settlement, so a double-clicked confirm turns
 * into a 400 rather than a second audit row.
 */
@CommandHandler(SettlePaymentCommand)
export class SettlePaymentHandler
  implements ICommandHandler<SettlePaymentCommand, SettlePaymentResult>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(ACTION_TYPE_REPOSITORY)
    private readonly actionTypes: ActionTypeRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER) private readonly transaction: TransactionRunner,
    private readonly events: EventRecorder,
  ) {}

  async execute({
    input,
  }: SettlePaymentCommand): Promise<SettlePaymentResult> {
    const payment = await this.payments.findById(Identifier.of(input.paymentId))
    // Scoped to the request in the route: a payment that belongs to a different
    // request is reported as missing rather than as forbidden, so the endpoint
    // cannot be used to discover which ids exist.
    if (!payment || payment.snapshot().requestId !== input.requestId)
      throw new EntityNotFoundError('Payment', input.paymentId)

    const code = ACTION_CODE[input.settlement]
    const actionType = await this.actionTypes.findByCode(code)
    if (!actionType) throw new EntityNotFoundError('ActionType', code)

    const actor = Identifier.of(input.actorId)
    const before = payment.snapshot()

    await this.transaction.run(async () => {
      if (input.settlement === PaymentSettlement.CONFIRM) {
        payment.confirm(actor)
      } else {
        // The domain refuses an empty reason; the DTO refuses a short one.
        payment.waive(actor, input.reason ?? '')
      }
      await this.payments.save(payment)
      await this.actions.append(
        RequestAction.create(this.ids.next(), {
          requestId: Identifier.of(before.requestId),
          actorId: actor,
          actionTypeId: actionType.id,
          requestStepInstanceId: before.requestStepInstanceId
            ? Identifier.of(before.requestStepInstanceId)
            : undefined,
          comment:
            input.settlement === PaymentSettlement.WAIVE
              ? `Fee waived (${before.amount} ${before.currency}): ${input.reason}`
              : `Fee confirmed: ${before.amount} ${before.currency}`,
        }),
      )
      await this.events.actionTaken({
        requestId: before.requestId,
        actorId: input.actorId,
        actionTypeId: actionType.id.toString(),
        stepInstanceId: before.requestStepInstanceId ?? undefined,
      })
    })

    const after = payment.snapshot()
    return {
      id: payment.id.toString(),
      status: after.status,
      settledAt: after.settledAt?.toISOString(),
    }
  }
}
