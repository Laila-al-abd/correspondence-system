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
exports.ListAttributeDefinitionsHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const attribute_definition_view_1 = require("../views/attribute-definition.view");
const list_attribute_definitions_query_1 = require("./list-attribute-definitions.query");
let ListAttributeDefinitionsHandler = class ListAttributeDefinitionsHandler {
    attributeDefinitions;
    constructor(attributeDefinitions) {
        this.attributeDefinitions = attributeDefinitions;
    }
    async execute() {
        const definitions = await this.attributeDefinitions.list();
        return definitions.map((def) => (0, attribute_definition_view_1.toAttributeDefinitionView)(def));
    }
};
exports.ListAttributeDefinitionsHandler = ListAttributeDefinitionsHandler;
exports.ListAttributeDefinitionsHandler = ListAttributeDefinitionsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_attribute_definitions_query_1.ListAttributeDefinitionsQuery),
    __param(0, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListAttributeDefinitionsHandler);
//# sourceMappingURL=list-attribute-definitions.handler.js.map