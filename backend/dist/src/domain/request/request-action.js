"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestAction = void 0;
const entity_1 = require("../shared/entity");
class RequestAction extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new RequestAction(id, { ...p, createdAt: new Date() });
    }
    static rehydrate(id, props) {
        return new RequestAction(id, props);
    }
    get requestId() { return this.props.requestId; }
    get actorId() { return this.props.actorId; }
    get actionTypeId() { return this.props.actionTypeId; }
    get requestStepInstanceId() { return this.props.requestStepInstanceId; }
    snapshot() {
        return {
            requestId: this.props.requestId.toString(),
            requestStepInstanceId: this.props.requestStepInstanceId?.toString(),
            actorId: this.props.actorId.toString(),
            actionTypeId: this.props.actionTypeId.toString(),
            comment: this.props.comment,
            createdAt: this.props.createdAt,
        };
    }
}
exports.RequestAction = RequestAction;
//# sourceMappingURL=request-action.js.map