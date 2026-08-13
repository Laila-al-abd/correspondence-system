import { DependencyHealthService, HealthReport } from '../../infrastructure/observability/dependency-health.service';
export declare class HealthController {
    private readonly probes;
    constructor(probes: DependencyHealthService);
    liveness(): {
        status: 'ok';
    };
    detailed(): Promise<HealthReport>;
}
