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
exports.GetTemplateCatalogHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const get_template_catalog_query_1 = require("./get-template-catalog.query");
let GetTemplateCatalogHandler = class GetTemplateCatalogHandler {
    catalog;
    constructor(catalog) {
        this.catalog = catalog;
    }
    async execute(query) {
        const view = await this.catalog.findByIdOrCode(query.idOrCode);
        if (!view)
            throw new errors_1.EntityNotFoundError('Template', query.idOrCode);
        return view;
    }
};
exports.GetTemplateCatalogHandler = GetTemplateCatalogHandler;
exports.GetTemplateCatalogHandler = GetTemplateCatalogHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_template_catalog_query_1.GetTemplateCatalogQuery),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_CATALOG_QUERY)),
    __metadata("design:paramtypes", [Object])
], GetTemplateCatalogHandler);
//# sourceMappingURL=get-template-catalog.handler.js.map