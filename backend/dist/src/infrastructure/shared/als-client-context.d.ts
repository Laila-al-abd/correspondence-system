import type { ClientContextPort } from '../../application/observability/ports/client-context.port';
export declare class AlsClientContext implements ClientContextPort {
    userId(): string | undefined;
    ipAddress(): string | undefined;
}
