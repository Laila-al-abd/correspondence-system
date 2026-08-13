"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalRef = void 0;
const value_object_1 = require("../../shared/value-object");
const guard_1 = require("../../shared/guard");
class ExternalRef extends value_object_1.ValueObject {
    constructor(props) { super(props); }
    static create(id, source) {
        return new ExternalRef({ id: guard_1.Guard.againstEmpty(id, "externalId"), source: guard_1.Guard.againstEmpty(source, "sourceSystem")
        });
    }
    get id() { return this.props.id; }
    get source() { return this.props.source; }
}
exports.ExternalRef = ExternalRef;
//# sourceMappingURL=external-ref.js.map