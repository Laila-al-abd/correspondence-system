import { Injectable } from '@nestjs/common'
import { MlPrediction } from '../../domain/observability/ml-prediction'
import { MlPredictionRepository } from '../../domain/observability/ports/ml-prediction.repository'
import { ModelType } from '../../domain/observability/enums'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { MlPredictionMapper } from './ml-prediction.mapper'

/**
 * Prisma-backed MlPredictionRepository over the `ml_predictions` table. Stores
 * every inference for auditing and KPI dashboards; `latestFor` returns the most
 * recent prediction of a given model type for a request.
 */
@Injectable()
export class PrismaMlPredictionRepository implements MlPredictionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(prediction: MlPrediction): Promise<void> {
    const data = MlPredictionMapper.toPersistence(prediction)
    await this.prisma.mlPrediction.upsert({
      where: { id: BigInt(prediction.id.toString()) },
      create: data,
      update: data,
    })
  }

  async listByRequest(requestId: Identifier): Promise<MlPrediction[]> {
    const rows = await this.prisma.mlPrediction.findMany({
      where: { requestId: BigInt(requestId.toString()) },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => MlPredictionMapper.toDomain(row))
  }

  async latestFor(
    requestId: Identifier,
    modelType: ModelType,
  ): Promise<MlPrediction | null> {
    const row = await this.prisma.mlPrediction.findFirst({
      where: { requestId: BigInt(requestId.toString()), modelType },
      orderBy: { id: 'desc' },
    })
    return row ? MlPredictionMapper.toDomain(row) : null
  }
}
