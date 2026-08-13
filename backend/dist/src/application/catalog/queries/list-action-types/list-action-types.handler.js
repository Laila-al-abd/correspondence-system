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
exports.ListActionTypesHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const list_action_types_query_1 = require("./list-action-types.query");
let ListActionTypesHandler = class ListActionTypesHandler {
    actionTypes;
    constructor(actionTypes) {
        this.actionTypes = actionTypes;
    }
    async execute(query) {
        const all = await this.actionTypes.list();
        return all
            .filter((at) => query.onlyTerminal === undefined || at.isTerminal === query.onlyTerminal)
            .map((at) => ({
            id: at.id.toString(),
            code: at.code,
            name: at.name.toJSON(),
            isTerminal: at.isTerminal,
        }));
    }
};
exports.ListActionTypesHandler = ListActionTypesHandler;
exports.ListActionTypesHandler = ListActionTypesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_action_types_query_1.ListActionTypesQuery),
    __param(0, (0, common_1.Inject)(tokens_1.ACTION_TYPE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListActionTypesHandler);
//# sourceMappingURL=list-action-types.handler.js.map