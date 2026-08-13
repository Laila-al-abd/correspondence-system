export declare class StreamTicketService {
    private readonly logger;
    private readonly tickets;
    issue(userId: string): {
        ticket: string;
        expiresInSeconds: number;
    };
    redeem(ticket: string): string | null;
    private sweepExpired;
}
