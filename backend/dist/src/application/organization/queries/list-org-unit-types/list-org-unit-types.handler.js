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
exports.ListOrgUnitTypesHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const list_org_unit_types_query_1 = require("./list-org-unit-types.query");
let ListOrgUnitTypesHandler = class ListOrgUnitTypesHandler {
    unitTypes;
    constructor(unitTypes) {
        this.unitTypes = unitTypes;
    }
    async execute(query) {
        const all = await this.unitTypes.list();
        return all.map((ut) => ({
            id: ut.id.toString(),
            code: ut.code,
            name: ut.name.toJSON(),
        }));
    }
};
exports.ListOrgUnitTypesHandler = ListOrgUnitTypesHandler;
exports.ListOrgUnitTypesHandler = ListOrgUnitTypesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_org_unit_types_query_1.ListOrgUnitTypesQuery),
    __param(0, (0, common_1.Inject)(tokens_1.ORG_UNIT_TYPE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListOrgUnitTypesHandler);
//# sourceMappingURL=list-org-unit-types.handler.js.map