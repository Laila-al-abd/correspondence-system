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
exports.PrismaTransactionRunner = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const transaction_context_1 = require("./transaction-context");
const TRANSACTION_TIMEOUT_MS = 15_000;
let PrismaTransactionRunner = class PrismaTransactionRunner {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async run(work) {
        if (transaction_context_1.TransactionContext.isActive())
            return work();
        return this.prisma.$transaction(async (tx) => transaction_context_1.TransactionContext.run(tx, work), { timeout: TRANSACTION_TIMEOUT_MS });
    }
};
exports.PrismaTransactionRunner = PrismaTransactionRunner;
exports.PrismaTransactionRunner = PrismaTransactionRunner = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTransactionRunner);
//# sourceMappingURL=prisma-transaction-runner.js.map