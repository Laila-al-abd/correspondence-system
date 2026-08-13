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
exports.ListAssignedRequestsHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const list_assigned_requests_query_1 = require("./list-assigned-requests.query");
let ListAssignedRequestsHandler = class ListAssignedRequestsHandler {
    requests;
    constructor(requests) {
        this.requests = requests;
    }
    execute(query) {
        return this.requests.listAssignedTo({
            userId: query.userId,
            limit: query.limit,
            cursor: query.cursor,
            readyOnly: query.readyOnly,
        });
    }
};
exports.ListAssignedRequestsHandler = ListAssignedRequestsHandler;
exports.ListAssignedRequestsHandler = ListAssignedRequestsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_assigned_requests_query_1.ListAssignedRequestsQuery),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_QUERY)),
    __metadata("design:paramtypes", [Object])
], ListAssignedRequestsHandler);
//# sourceMappingURL=list-assigned-requests.handler.js.map