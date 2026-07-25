import { Module } from '@nestjs/common'
import { ReportsService } from '../../application/reporting/reports.service'
import { PrismaReportsQuery } from '../../infrastructure/reporting/prisma-reports-query'
import { REPORTS_QUERY } from '../../application/tokens'
import { ReportsController } from './reports.controller'

/**
 * Reporting composition root. Binds the ReportsQuery port to its Prisma read
 * adapter and exposes the admin monitoring reports over HTTP. PrismaService is
 * provided globally by PersistenceModule, so no import is required here.
 */
@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    { provide: REPORTS_QUERY, useClass: PrismaReportsQuery },
  ],
})
export class ReportsModule {}
