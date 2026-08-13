"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StreamTicketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamTicketService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const TICKET_TTL_MS = 30_000;
let StreamTicketService = StreamTicketService_1 = class StreamTicketService {
    logger = new common_1.Logger(StreamTicketService_1.name);
    tickets = new Map();
    issue(userId) {
        this.sweepExpired();
        const ticket = (0, node_crypto_1.randomBytes)(32).toString('base64url');
        this.tickets.set(ticket, {
            userId,
            expiresAt: Date.now() + TICKET_TTL_MS,
        });
        return { ticket, expiresInSeconds: TICKET_TTL_MS / 1000 };
    }
    redeem(ticket) {
        const issued = this.tickets.get(ticket);
        if (!issued)
            return null;
        this.tickets.delete(ticket);
        if (issued.expiresAt <= Date.now())
            return null;
        return issued.userId;
    }
    sweepExpired() {
        const now = Date.now();
        let removed = 0;
        for (const [ticket, issued] of this.tickets)
            if (issued.expiresAt <= now) {
                this.tickets.delete(ticket);
                removed++;
            }
        if (removed > 0)
            this.logger.debug(`Swept ${removed} expired stream ticket(s).`);
    }
};
exports.StreamTicketService = StreamTicketService;
exports.StreamTicketService = StreamTicketService = StreamTicketService_1 = __decorate([
    (0, common_1.Injectable)()
], StreamTicketService);
//# sourceMappingURL=stream-ticket.service.js.map