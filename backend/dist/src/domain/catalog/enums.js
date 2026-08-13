"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleOperator = exports.FieldDataType = exports.AttributeDataType = void 0;
var AttributeDataType;
(function (AttributeDataType) {
    AttributeDataType["TEXT"] = "TEXT";
    AttributeDataType["NUMBER"] = "NUMBER";
    AttributeDataType["DATE"] = "DATE";
    AttributeDataType["BOOLEAN"] = "BOOLEAN";
    AttributeDataType["ENUM"] = "ENUM";
})(AttributeDataType || (exports.AttributeDataType = AttributeDataType = {}));
var FieldDataType;
(function (FieldDataType) {
    FieldDataType["TEXT"] = "TEXT";
    FieldDataType["NUMBER"] = "NUMBER";
    FieldDataType["DATE"] = "DATE";
    FieldDataType["BOOLEAN"] = "BOOLEAN";
    FieldDataType["ENUM"] = "ENUM";
})(FieldDataType || (exports.FieldDataType = FieldDataType = {}));
var RuleOperator;
(function (RuleOperator) {
    RuleOperator["EQ"] = "EQ";
    RuleOperator["NEQ"] = "NEQ";
    RuleOperator["IN"] = "IN";
    RuleOperator["GTE"] = "GTE";
    RuleOperator["LTE"] = "LTE";
})(RuleOperator || (exports.RuleOperator = RuleOperator = {}));
//# sourceMappingURL=enums.js.map