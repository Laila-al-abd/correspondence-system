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
exports.PrismaReferenceNumberGenerator = void 0;
const common_1 = require("@nestjs/common");
const numbering_scheme_1 = require("../../domain/request/value-objects/numbering-scheme");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const SETTING_KEY = 'request_numbering';
let PrismaReferenceNumberGenerator = class PrismaReferenceNumberGenerator {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async next(at = new Date()) {
        const scheme = await this.loadScheme();
        const scope = scheme.scopeFor(at);
        const sequence = await this.reserve(scope);
        return scheme.format(sequence, at);
    }
    async loadScheme() {
        const setting = await this.db.systemSetting.findUnique({
            where: { key: SETTING_KEY },
        });
        const config = (setting?.value ?? {});
        return numbering_scheme_1.NumberingScheme.create(config);
    }
    async reserve(scope) {
        const rows = await this.db.$queryRaw `
      INSERT INTO request_number_sequences (scope, current_value, updated_at)
      VALUES (${scope}, 1, now())
      ON CONFLICT (scope) DO UPDATE
        SET current_value = request_number_sequences.current_value + 1,
            updated_at = now()
      RETURNING current_value
    `;
        return Number(rows[0].current_value);
    }
};
exports.PrismaReferenceNumberGenerator = PrismaReferenceNumberGenerator;
exports.PrismaReferenceNumberGenerator = PrismaReferenceNumberGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaReferenceNumberGenerator);
//# sourceMappingURL=prisma-reference-number.generator.js.map