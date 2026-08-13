"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionalNumber = void 0;
const value_object_1 = require("../../shared/value-object");
const guard_1 = require("../../shared/guard");
class InstitutionalNumber extends value_object_1.ValueObject {
    constructor(value) { super({ value }); }
    static create(raw) {
        return new InstitutionalNumber(guard_1.Guard.againstEmpty(raw, "institutionalNumber"));
    }
    get value() { return this.props.value; }
}
exports.InstitutionalNumber = InstitutionalNumber;
//# sourceMappingURL=institutional-number.js.map