import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  ReconciliationReport,
  StorageReconciliationService,
} from '../../infrastructure/storage/storage-reconciliation.service'
import { RequirePermissions } from '../identity/permissions.decorator'

/**
 * Operational maintenance actions, for the people who run the system rather
 * than the people who use it.
 *
 * Guarded by `system.monitor`, the same permission as /health/detailed. That is
 * the point of having introduced it: watching the machinery is a distinct duty
 * from administering users, and an operator should be able to do this without
 * also being able to grant themselves every other power in the system.
 */
@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly reconciliation: StorageReconciliationService) {}

  /**
   * Runs the orphan sweep now and returns its report.
   *
   * POST rather than GET even though nothing is modified: the call is
   * expensive, walks the whole bucket, and must not be something a browser
   * prefetch or a crawler can start. 200 rather than 202 because the report is
   * the response -- the caller waits for it.
   */
  @Post('storage-reconciliation')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('system.monitor')
  runStorageReconciliation(): Promise<ReconciliationReport> {
    return this.reconciliation.sweep()
  }
}
