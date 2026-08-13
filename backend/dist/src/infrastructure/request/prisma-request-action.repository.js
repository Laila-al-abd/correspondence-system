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
exports.PrismaRequestActionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const request_action_mapper_1 = require("./request-action.mapper");
let PrismaRequestActionRepository = class PrismaRequestActionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async append(action) {
        await this.db.requestAction.create({
            data: request_action_mapper_1.RequestActionMapper.toPersistence(action),
        });
    }
    async listByRequest(requestId) {
        const rows = await this.db.requestAction.findMany({
            where: { requestId: requestId.toString() },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => request_action_mapper_1.RequestActionMapper.toDomain(row));
    }
};
exports.PrismaRequestActionRepository = PrismaRequestActionRepository;
exports.PrismaRequestActionRepository = PrismaRequestActionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRequestActionRepository);
//# sourceMappingURL=prisma-request-action.repository.js.map