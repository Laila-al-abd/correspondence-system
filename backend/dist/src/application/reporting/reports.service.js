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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const tokens_1 = require("../tokens");
let ReportsService = class ReportsService {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    async overview(range) {
        const c = await this.reports.overview(range);
        const classified = c.classifiedNlp + c.classifiedHitl;
        return {
            ...c,
            openRequests: c.inProgress + c.onHold,
            completionRate: this.ratio(c.completed, c.totalRequests),
            hitlRate: this.ratio(c.classifiedHitl, classified),
        };
    }
    volumeByPeriod(range, groupBy) {
        return this.reports.volumeByPeriod(range, groupBy);
    }
    pathPerformance(range) {
        return this.reports.pathPerformance(range);
    }
    stepBottlenecks(range) {
        return this.reports.stepBottlenecks(range);
    }
    async classification(range) {
        const c = await this.reports.classification(range);
        const classified = c.nlpCount + c.hitlCount;
        return {
            ...c,
            nlpShare: this.ratio(c.nlpCount, classified),
            hitlRate: this.ratio(c.hitlCount, classified),
        };
    }
    ratio(numerator, denominator) {
        if (!denominator)
            return null;
        return Math.round((numerator / denominator) * 10000) / 10000;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.REPORTS_QUERY)),
    __metadata("design:paramtypes", [Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map