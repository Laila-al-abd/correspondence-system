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
exports.EventRecorder = void 0;
const common_1 = require("@nestjs/common");
const event_log_1 = require("../../../domain/observability/event-log");
const identifier_1 = require("../../../domain/shared/identifier");
const tokens_1 = require("../../tokens");
let EventRecorder = class EventRecorder {
    events;
    ids;
    client;
    constructor(events, ids, client) {
        this.events = events;
        this.ids = ids;
        this.client = client;
    }
    async statusChanged(p) {
        await this.events.append(event_log_1.EventLog.statusChanged(this.ids.next(), {
            requestId: identifier_1.Identifier.of(p.requestId),
            from: p.from,
            to: p.to,
            actorId: this.actor(p.actorId),
            ipAddress: this.client.ipAddress(),
        }));
    }
    async actionTaken(p) {
        await this.events.append(event_log_1.EventLog.actionTaken(this.ids.next(), {
            requestId: identifier_1.Identifier.of(p.requestId),
            actorId: identifier_1.Identifier.of(p.actorId),
            actionTypeId: identifier_1.Identifier.of(p.actionTypeId),
            requestStepInstanceId: p.stepInstanceId
                ? identifier_1.Identifier.of(p.stepInstanceId)
                : undefined,
            ipAddress: this.client.ipAddress(),
        }));
    }
    async stepStarted(p) {
        await this.events.append(event_log_1.EventLog.stepStarted(this.ids.next(), {
            requestId: identifier_1.Identifier.of(p.requestId),
            requestStepInstanceId: identifier_1.Identifier.of(p.stepInstanceId),
            actorId: this.actor(p.actorId),
            ipAddress: this.client.ipAddress(),
        }));
    }
    async stepCompleted(p) {
        await this.events.append(event_log_1.EventLog.stepCompleted(this.ids.next(), {
            requestId: identifier_1.Identifier.of(p.requestId),
            requestStepInstanceId: identifier_1.Identifier.of(p.stepInstanceId),
            actorId: this.actor(p.actorId),
            ipAddress: this.client.ipAddress(),
        }));
    }
    async assigned(p) {
        await this.events.append(event_log_1.EventLog.assigned(this.ids.next(), {
            requestId: identifier_1.Identifier.of(p.requestId),
            requestStepInstanceId: identifier_1.Identifier.of(p.stepInstanceId),
            actorId: this.actor(p.actorId),
            ipAddress: this.client.ipAddress(),
        }));
    }
    actor(explicit) {
        const actorId = explicit ?? this.client.userId();
        return actorId ? identifier_1.Identifier.of(actorId) : undefined;
    }
};
exports.EventRecorder = EventRecorder;
exports.EventRecorder = EventRecorder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.EVENT_LOG_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(2, (0, common_1.Inject)(tokens_1.CLIENT_CONTEXT)),
    __metadata("design:paramtypes", [Object, Object, Object])
], EventRecorder);
//# sourceMappingURL=event-recorder.js.map