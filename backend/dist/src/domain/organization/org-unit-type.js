"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgUnitType = void 0;
const entity_1 = require("../shared/entity");
class OrgUnitType extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static rehydrate(id, props) {
        return new OrgUnitType(id, props);
    }
    get kind() { return this.props.kind; }
    get code() { return this.props.kind; }
    get name() { return this.props.name; }
}
exports.OrgUnitType = OrgUnitType;
//# sourceMappingURL=org-unit-type.js.map