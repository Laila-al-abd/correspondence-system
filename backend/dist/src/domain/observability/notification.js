"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const entity_1 = require("../shared/entity");
const guard_1 = require("../shared/guard");
class Notification extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        guard_1.Guard.againstEmpty(p.title, "title");
        guard_1.Guard.againstEmpty(p.type, "type");
        return new Notification(id, { ...p, isRead: false, createdAt: new Date() });
    }
    static rehydrate(id, props) {
        return new Notification(id, props);
    }
    snapshot() {
        return {
            userId: this.props.userId.toString(),
            requestId: this.props.requestId?.toString(),
            type: this.props.type,
            title: this.props.title,
            body: this.props.body,
            isRead: this.props.isRead,
            createdAt: this.props.createdAt,
        };
    }
    markRead() { this.props.isRead = true; }
    get isRead() { return this.props.isRead; }
    get userId() { return this.props.userId; }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.js.map