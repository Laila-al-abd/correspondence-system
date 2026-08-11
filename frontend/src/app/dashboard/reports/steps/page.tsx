'use client';
import { useStepBottlenecksReport } from '@/lib/hooks/use-reports';
import { ReportFilters, ReportFiltersState, useReportDateFilters } from '@/components/forms/report-filters';
import { downloadReportCsv } from '@/lib/reports/download-csv';
import { PermissionGate } from '@/components/permission-gate';
import { ReportsNav } from '@/components/reports-nav';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

function formatHours(h: number | null): string {
  return h === null ? '—' : `${h.toFixed(1)}h`;
}

function StepsContent() {
  const [filters, setFilters] = useReportDateFilters();
  const { data, isLoading, isError } = useStepBottlenecksReport({ from: filters.from, to: filters.to });

  function handleFiltersChange(next: ReportFiltersState) {
    if (next.format === 'csv') {
      void downloadReportCsv('/reports/steps', { from: next.from, to: next.to }, 'step-bottlenecks');
      return;
    }
    setFilters(next);
  }

  const rows = data ?? [];

  return (
    <div className="p-6 space-y-6">
      <ReportsNav />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
        Step bottlenecks
      </h1>

      <ReportFilters
        title="Filters"
        description="Filter by request creation date."
        initial={filters}
        onChange={handleFiltersChange}
      />

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load the step bottlenecks report.</p>}
      {!isLoading && !isError && rows.length === 0 && (
        <p className="text-muted-foreground">No data for this range.</p>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Instances</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Avg wait</TableHead>
              <TableHead>Avg processing</TableHead>
              <TableHead>Breached</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.stepId}>
                <TableCell>{row.stepName ?? row.stepId}</TableCell>
                <TableCell>{row.pathName ?? row.pathId}</TableCell>
                <TableCell>{row.instanceCount}</TableCell>
                <TableCell>{row.openCount}</TableCell>
                <TableCell>{formatHours(row.avgWaitHours)}</TableCell>
                <TableCell>{formatHours(row.avgProcessingHours)}</TableCell>
                <TableCell>{row.breachedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function StepsReportPage() {
  return (
    <PermissionGate require="reports.view">
      <StepsContent />
    </PermissionGate>
  );
}