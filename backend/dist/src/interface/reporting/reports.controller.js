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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("../../application/reporting/reports.service");
const permissions_decorator_1 = require("../identity/permissions.decorator");
const report_query_dto_1 = require("./dto/report-query.dto");
const volume_query_dto_1 = require("./dto/volume-query.dto");
const csv_util_1 = require("./csv.util");
let ReportsController = class ReportsController {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    async overview(query, res) {
        const data = await this.reports.overview(this.range(query));
        return this.respond(res, query.format, 'overview', data, [data]);
    }
    async volume(query, res) {
        const data = await this.reports.volumeByPeriod(this.range(query), query.groupBy ?? 'day');
        return this.respond(res, query.format, 'request-volume', data, data);
    }
    async paths(query, res) {
        const data = await this.reports.pathPerformance(this.range(query));
        return this.respond(res, query.format, 'path-performance', data, data);
    }
    async steps(query, res) {
        const data = await this.reports.stepBottlenecks(this.range(query));
        return this.respond(res, query.format, 'step-bottlenecks', data, data);
    }
    async classification(query, res) {
        const data = await this.reports.classification(this.range(query));
        return this.respond(res, query.format, 'classification', data, [data]);
    }
    range(query) {
        return {
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        };
    }
    respond(res, format, filename, json, csvRows) {
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            return (0, csv_util_1.toCsv)(csvRows);
        }
        return json;
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('volume'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [volume_query_dto_1.VolumeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "volume", null);
__decorate([
    (0, common_1.Get)('paths'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "paths", null);
__decorate([
    (0, common_1.Get)('steps'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "steps", null);
__decorate([
    (0, common_1.Get)('classification'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "classification", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map