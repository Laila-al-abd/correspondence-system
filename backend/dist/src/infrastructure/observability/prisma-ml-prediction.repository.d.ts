import { MlPrediction } from '../../domain/observability/ml-prediction';
import { MlPredictionRepository } from '../../domain/observability/ports/ml-prediction.repository';
import { ModelType } from '../../domain/observability/enums';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaMlPredictionRepository implements MlPredictionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    save(prediction: MlPrediction): Promise<void>;
    listByRequest(requestId: Identifier): Promise<MlPrediction[]>;
    latestFor(requestId: Identifier, modelType: ModelType): Promise<MlPrediction | null>;
}
