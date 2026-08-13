import { Prisma, MlPrediction as MlPredictionRow } from '../../../generated/prisma/client';
import { MlPrediction } from '../../domain/observability/ml-prediction';
export declare const MlPredictionMapper: {
    toDomain(row: MlPredictionRow): MlPrediction;
    toPersistence(prediction: MlPrediction): Prisma.MlPredictionUncheckedCreateInput;
};
