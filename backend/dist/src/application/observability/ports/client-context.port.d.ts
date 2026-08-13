export interface ClientContextPort {
    userId(): string | undefined;
    ipAddress(): string | undefined;
}
