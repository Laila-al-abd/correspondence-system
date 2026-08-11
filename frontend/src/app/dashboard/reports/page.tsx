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
import { useOverviewReport } from '@/lib/hooks/use-reports';
import { ReportFilters, ReportFiltersState, useReportDateFilters } from '@/components/forms/report-filters';
import { downloadReportCsv } from '@/lib/reports/download-csv';
import { PermissionGate } from '@/components/permission-gate';
import { ReportsNav } from '@/components/reports-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatPercent(ratio: number | null): string {
  return ratio === null ? '—' : `${(ratio * 100).toFixed(1)}%`;
}
function formatHours(hours: number | null): string {
  return hours === null ? '—' : `${hours.toFixed(1)}h`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground uppercase">{label}</p>
        <p className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function OverviewContent() {
  const [filters, setFilters] = useReportDateFilters();
  const { data, isLoading, isError } = useOverviewReport({ from: filters.from, to: filters.to });

  function handleFiltersChange(next: ReportFiltersState) {
    if (next.format === 'csv') {
      void downloadReportCsv('/reports/overview', { from: next.from, to: next.to }, 'overview');
      return;
    }
    setFilters(next);
  }

  const statusChartData = data
    ? [
        { status: 'Draft', count: data.draft },
        { status: 'In progress', count: data.inProgress },
        { status: 'On hold', count: data.onHold },
        { status: 'Completed', count: data.completed },
        { status: 'Rejected', count: data.rejected },
        { status: 'Cancelled', count: data.cancelled },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <ReportsNav />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
        Overview
      </h1>

      <ReportFilters
        title="Filters"
        description="Filter by request creation date."
        initial={filters}
        onChange={handleFiltersChange}
      />

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load the overview report.</p>}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: 'var(--ics-primary)' }}>
                Requests by status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--ics-text) 12%, transparent)" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="var(--ics-text)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--ics-text)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--ics-background)',
                      border: '1px solid color-mix(in srgb, var(--ics-primary) 25%, transparent)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="count" name="Requests" fill="var(--ics-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard label="Total requests" value={data.totalRequests} />
            <StatCard label="Open requests" value={data.openRequests} />
            <StatCard label="Draft" value={data.draft} />
            <StatCard label="In progress" value={data.inProgress} />
            <StatCard label="On hold" value={data.onHold} />
            <StatCard label="Completed" value={data.completed} />
            <StatCard label="Rejected" value={data.rejected} />
            <StatCard label="Cancelled" value={data.cancelled} />
            <StatCard label="Completion rate" value={formatPercent(data.completionRate)} />
            <StatCard label="SLA on track" value={data.slaOnTrack} />
            <StatCard label="SLA at risk" value={data.slaAtRisk} />
            <StatCard label="SLA breached" value={data.slaBreached} />
            <StatCard label="Open step instances" value={data.openStepInstances} />
            <StatCard label="Avg turnaround" value={formatHours(data.avgTurnaroundHours)} />
            <StatCard label="Classified (NLP)" value={data.classifiedNlp} />
            <StatCard label="Classified (HITL)" value={data.classifiedHitl} />
            <StatCard label="Classification pending" value={data.classificationPending} />
            <StatCard label="HITL rate" value={formatPercent(data.hitlRate)} />
            <StatCard label="Avg confidence" value={data.avgConfidence !== null ? data.avgConfidence.toFixed(2) : '—'} />
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportsOverviewPage() {
  return (
    <PermissionGate require="reports.view">
      <OverviewContent />
    </PermissionGate>
  );
}