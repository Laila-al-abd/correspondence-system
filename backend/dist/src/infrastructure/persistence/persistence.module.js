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
exports.PersistenceModule = void 0;
const common_1 = require("@nestjs/common");
const tokens_1 = require("../../application/tokens");
const prisma_service_1 = require("./prisma.service");
const prisma_transaction_runner_1 = require("./prisma-transaction-runner");
let PersistenceModule = class PersistenceModule {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
};
exports.PersistenceModule = PersistenceModule;
exports.PersistenceModule = PersistenceModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            prisma_transaction_runner_1.PrismaTransactionRunner,
            { provide: tokens_1.TRANSACTION_RUNNER, useExisting: prisma_transaction_runner_1.PrismaTransactionRunner },
        ],
        exports: [prisma_service_1.PrismaService, prisma_transaction_runner_1.PrismaTransactionRunner, tokens_1.TRANSACTION_RUNNER],
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersistenceModule);
//# sourceMappingURL=persistence.module.js.map