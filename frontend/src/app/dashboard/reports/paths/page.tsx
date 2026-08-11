'use client';
import { usePathPerformanceReport } from '@/lib/hooks/use-reports';
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

function PathsContent() {
  const [filters, setFilters] = useReportDateFilters();
  const { data, isLoading, isError } = usePathPerformanceReport({ from: filters.from, to: filters.to });

  function handleFiltersChange(next: ReportFiltersState) {
    if (next.format === 'csv') {
      void downloadReportCsv('/reports/paths', { from: next.from, to: next.to }, 'path-performance');
      return;
    }
    setFilters(next);
  }

  const rows = data ?? [];

  return (
    <div className="p-6 space-y-6">
      <ReportsNav />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
        Path performance
      </h1>

      <ReportFilters
        title="Filters"
        description="Filter by request creation date."
        initial={filters}
        onChange={handleFiltersChange}
      />

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load the path performance report.</p>}
      {!isLoading && !isError && rows.length === 0 && (
        <p className="text-muted-foreground">No data for this range.</p>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Avg turnaround</TableHead>
              <TableHead>Breached steps</TableHead>
              <TableHead>Avg delay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.pathId}>
                <TableCell>{row.pathName ?? row.pathId}</TableCell>
                <TableCell>{row.requestCount}</TableCell>
                <TableCell>{row.completedCount}</TableCell>
                <TableCell>{formatHours(row.avgTurnaroundHours)}</TableCell>
                <TableCell>{row.breachedSteps}</TableCell>
                <TableCell>{formatHours(row.avgDelayHours)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function PathsReportPage() {
  return (
    <PermissionGate require="reports.view">
      <PathsContent />
    </PermissionGate>
  );
}