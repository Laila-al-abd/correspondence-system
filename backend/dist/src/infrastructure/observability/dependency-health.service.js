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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyHealthService = void 0;
const common_1 = require("@nestjs/common");
const tokens_1 = require("../../application/tokens");
const prisma_service_1 = require("../persistence/prisma.service");
const PROBE_TIMEOUT_MS = 5_000;
let DependencyHealthService = class DependencyHealthService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async check() {
        const dependencies = await Promise.all([
            this.probe('postgres', () => this.prisma.$queryRaw `SELECT 1`),
            this.probe('object-storage', () => this.storage.ping()),
        ]);
        return {
            status: dependencies.every((d) => d.status === 'up') ? 'ok' : 'degraded',
            checkedAt: new Date().toISOString(),
            dependencies,
        };
    }
    async probe(name, run) {
        const startedAt = Date.now();
        try {
            await withTimeout(run(), PROBE_TIMEOUT_MS, name);
            return { name, status: 'up', latencyMs: Date.now() - startedAt };
        }
        catch (error) {
            return {
                name,
                status: 'down',
                latencyMs: Date.now() - startedAt,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
};
exports.DependencyHealthService = DependencyHealthService;
exports.DependencyHealthService = DependencyHealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(tokens_1.OBJECT_STORAGE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], DependencyHealthService);
function withTimeout(work, ms, name) {
    let timer;
    const expiry = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${name} did not respond within ${ms}ms`)), ms);
    });
    return Promise.race([work, expiry]).finally(() => clearTimeout(timer));
}
//# sourceMappingURL=dependency-health.service.js.map