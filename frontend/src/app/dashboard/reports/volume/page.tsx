'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useVolumeReport } from '@/lib/hooks/use-reports';
import { ReportFilters, ReportFiltersState, useVolumeReportFilters } from '@/components/forms/report-filters';
import { downloadReportCsv } from '@/lib/reports/download-csv';
import { PermissionGate } from '@/components/permission-gate';
import { ReportsNav } from '@/components/reports-nav';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

function VolumeContent() {
  const [filters, setFilters] = useVolumeReportFilters();
  const { data, isLoading, isError } = useVolumeReport({
    from: filters.from,
    to: filters.to,
    groupBy: filters.groupBy,
  });

  function handleFiltersChange(next: ReportFiltersState) {
    if (next.format === 'csv') {
      void downloadReportCsv(
        '/reports/volume',
        { from: next.from, to: next.to, groupBy: next.groupBy },
        'request-volume',
      );
      return;
    }
    setFilters(next);
  }

  const rows = data ?? [];

  return (
    <div className="p-6 space-y-6">
      <ReportsNav />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
        Request volume
      </h1>

      <ReportFilters
        title="Filters"
        description="Time-series bucket size and date range."
        initial={filters}
        showGroupBy
        onChange={handleFiltersChange}
      />

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load the volume report.</p>}
      {!isLoading && !isError && rows.length === 0 && (
        <p className="text-muted-foreground">No data for this range.</p>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={rows} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--ics-text) 12%, transparent)" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="var(--ics-text)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--ics-text)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--ics-background)',
                      border: '1px solid color-mix(in srgb, var(--ics-primary) 25%, transparent)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="count" name="Requests" fill="var(--ics-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.period}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}

export default function VolumeReportPage() {
  return (
    <PermissionGate require="reports.view">
      <VolumeContent />
    </PermissionGate>
  );
}