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
exports.PrismaEventLogRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const event_log_mapper_1 = require("./event-log.mapper");
let PrismaEventLogRepository = class PrismaEventLogRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async append(event) {
        await this.db.eventLog.create({
            data: event_log_mapper_1.EventLogMapper.toPersistence(event),
        });
    }
    async listByRequest(requestId) {
        const rows = await this.db.eventLog.findMany({
            where: { requestId: requestId.toString() },
            orderBy: { occurredAt: 'asc' },
        });
        return rows.map((row) => event_log_mapper_1.EventLogMapper.toDomain(row));
    }
};
exports.PrismaEventLogRepository = PrismaEventLogRepository;
exports.PrismaEventLogRepository = PrismaEventLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaEventLogRepository);
//# sourceMappingURL=prisma-event-log.repository.js.map