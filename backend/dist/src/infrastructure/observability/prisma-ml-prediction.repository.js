"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMlPredictionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const ml_prediction_mapper_1 = require("./ml-prediction.mapper");
let PrismaMlPredictionRepository = class PrismaMlPredictionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async save(prediction) {
        const data = ml_prediction_mapper_1.MlPredictionMapper.toPersistence(prediction);
        await this.db.mlPrediction.upsert({
            where: { id: prediction.id.toString() },
            create: data,
            update: data,
        });
    }
    async listByRequest(requestId) {
        const rows = await this.db.mlPrediction.findMany({
            where: { requestId: requestId.toString() },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => ml_prediction_mapper_1.MlPredictionMapper.toDomain(row));
    }
    async latestFor(requestId, modelType) {
        const row = await this.db.mlPrediction.findFirst({
            where: { requestId: requestId.toString(), modelType },
            orderBy: { id: 'desc' },
        });
        return row ? ml_prediction_mapper_1.MlPredictionMapper.toDomain(row) : null;
    }
};
exports.PrismaMlPredictionRepository = PrismaMlPredictionRepository;
exports.PrismaMlPredictionRepository = PrismaMlPredictionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaMlPredictionRepository);
//# sourceMappingURL=prisma-ml-prediction.repository.js.map