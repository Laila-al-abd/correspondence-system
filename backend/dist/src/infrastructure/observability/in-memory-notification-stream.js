"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InMemoryNotificationStream_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryNotificationStream = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let InMemoryNotificationStream = InMemoryNotificationStream_1 = class InMemoryNotificationStream {
    logger = new common_1.Logger(InMemoryNotificationStream_1.name);
    events = new rxjs_1.Subject();
    publish(userId, event) {
        try {
            this.events.next({ userId, event });
        }
        catch (error) {
            this.logger.warn(`Could not push a live notification to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    streamFor(userId) {
        return this.events.asObservable().pipe((0, rxjs_1.filter)((message) => message.userId === userId), (0, rxjs_1.map)((message) => message.event));
    }
    onModuleDestroy() {
        this.events.complete();
    }
};
exports.InMemoryNotificationStream = InMemoryNotificationStream;
exports.InMemoryNotificationStream = InMemoryNotificationStream = InMemoryNotificationStream_1 = __decorate([
    (0, common_1.Injectable)()
], InMemoryNotificationStream);
//# sourceMappingURL=in-memory-notification-stream.js.map