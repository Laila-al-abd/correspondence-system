"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlPredictionMapper = void 0;
const client_1 = require("../../../generated/prisma/client");
const ml_prediction_1 = require("../../domain/observability/ml-prediction");
const identifier_1 = require("../../domain/shared/identifier");
exports.MlPredictionMapper = {
    toDomain(row) {
        return ml_prediction_1.MlPrediction.rehydrate(identifier_1.Identifier.of(row.id), {
            requestId: identifier_1.Identifier.of(row.requestId),
            modelType: row.modelType,
            fieldKey: row.fieldKey ?? undefined,
            modelVersion: row.modelVersion,
            predictedValue: row.predictedValue,
            confidence: row.confidence != null ? row.confidence.toNumber() : undefined,
            createdAt: row.createdAt,
        });
    },
    toPersistence(prediction) {
        const s = prediction.snapshot();
        return {
            id: prediction.id.toString(),
            requestId: s.requestId,
            modelType: s.modelType,
            fieldKey: s.fieldKey ?? null,
            modelVersion: s.modelVersion,
            predictedValue: s.predictedValue === null || s.predictedValue === undefined
                ? client_1.Prisma.JsonNull
                : s.predictedValue,
            confidence: s.confidence ?? null,
            createdAt: s.createdAt,
        };
    },
};
//# sourceMappingURL=ml-prediction.mapper.js.map