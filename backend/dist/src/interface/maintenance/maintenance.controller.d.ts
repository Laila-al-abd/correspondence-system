import { ReconciliationReport, StorageReconciliationService } from '../../infrastructure/storage/storage-reconciliation.service';
export declare class MaintenanceController {
    private readonly reconciliation;
    constructor(reconciliation: StorageReconciliationService);
    runStorageReconciliation(): Promise<ReconciliationReport>;
}
