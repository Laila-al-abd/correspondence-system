import { Prisma, RequestAction as RequestActionRow } from '../../../generated/prisma/client'
import { RequestAction } from '../../domain/request/request-action'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the RequestAction entity and the `request_actions` row. */
export const RequestActionMapper = {
  toDomain(row: RequestActionRow): RequestAction {
    return RequestAction.rehydrate(Identifier.of(row.id), {
      requestId: Identifier.of(row.requestId),
      requestStepInstanceId:
        row.requestStepInstanceId != null
          ? Identifier.of(row.requestStepInstanceId)
          : undefined,
      actorId: Identifier.of(row.actorId),
      actionTypeId: Identifier.of(row.actionTypeId),
      comment: row.comment ?? undefined,
      createdAt: row.createdAt,
    })
  },

  toPersistence(action: RequestAction): Prisma.RequestActionUncheckedCreateInput {
    const s = action.snapshot()
    return {
      id: action.id.toString(),
      requestId: s.requestId,
      requestStepInstanceId: s.requestStepInstanceId
        ? s.requestStepInstanceId
        : null,
      actorId: s.actorId,
      actionTypeId: s.actionTypeId,
      comment: s.comment ?? null,
      createdAt: s.createdAt,
    }
  },
}
