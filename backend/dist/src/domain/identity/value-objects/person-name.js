"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonName = void 0;
const value_object_1 = require("../../shared/value-object");
const guard_1 = require("../../shared/guard");
class PersonName extends value_object_1.ValueObject {
    constructor(props) { super(props); }
    static create(ar, en) {
        return new PersonName({ ar: guard_1.Guard.againstEmpty(ar, "fullNameAr"), en: en?.trim() || undefined });
    }
    get ar() { return this.props.ar; }
    get en() { return this.props.en; }
}
exports.PersonName = PersonName;
//# sourceMappingURL=person-name.js.map