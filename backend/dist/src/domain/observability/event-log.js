"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLog = void 0;
const entity_1 = require("../shared/entity");
const enums_1 = require("./enums");
class EventLog extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static rehydrate(id, props) {
        return new EventLog(id, props);
    }
    static statusChanged(id, p) {
        return new EventLog(id, {
            requestId: p.requestId,
            eventType: enums_1.EventType.STATUS_CHANGE,
            fromStatus: p.from,
            toStatus: p.to,
            actorId: p.actorId,
            ipAddress: p.ipAddress,
            occurredAt: new Date(),
        });
    }
    static actionTaken(id, p) {
        return new EventLog(id, {
            requestId: p.requestId,
            requestStepInstanceId: p.requestStepInstanceId,
            actorId: p.actorId,
            actionTypeId: p.actionTypeId,
            eventType: enums_1.EventType.ACTION_TAKEN,
            ipAddress: p.ipAddress,
            occurredAt: new Date(),
        });
    }
    static stepStarted(id, p) {
        return new EventLog(id, {
            requestId: p.requestId,
            requestStepInstanceId: p.requestStepInstanceId,
            actorId: p.actorId,
            eventType: enums_1.EventType.STEP_STARTED,
            ipAddress: p.ipAddress,
            occurredAt: new Date(),
        });
    }
    static stepCompleted(id, p) {
        return new EventLog(id, {
            requestId: p.requestId,
            requestStepInstanceId: p.requestStepInstanceId,
            actorId: p.actorId,
            eventType: enums_1.EventType.STEP_COMPLETED,
            ipAddress: p.ipAddress,
            occurredAt: new Date(),
        });
    }
    static assigned(id, p) {
        return new EventLog(id, {
            requestId: p.requestId,
            requestStepInstanceId: p.requestStepInstanceId,
            actorId: p.actorId,
            eventType: enums_1.EventType.ASSIGNED,
            ipAddress: p.ipAddress,
            occurredAt: new Date(),
        });
    }
    snapshot() {
        return {
            requestId: this.props.requestId?.toString(),
            requestStepInstanceId: this.props.requestStepInstanceId?.toString(),
            actorId: this.props.actorId?.toString(),
            actionTypeId: this.props.actionTypeId?.toString(),
            eventType: this.props.eventType,
            fromStatus: this.props.fromStatus,
            toStatus: this.props.toStatus,
            ipAddress: this.props.ipAddress,
            occurredAt: this.props.occurredAt,
        };
    }
    get eventType() { return this.props.eventType; }
    get requestId() { return this.props.requestId; }
}
exports.EventLog = EventLog;
//# sourceMappingURL=event-log.js.map