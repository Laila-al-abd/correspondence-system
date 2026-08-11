'use client';
// Note: avgConfidenceHitl is deliberately NOT rendered here -- it exists on
// the frontend ClassificationCounts type but the backend's ClassificationCounts
// (reports-query.port.ts) never returns it, and ReportsService.classification()
// doesn't add it either. Displaying it would show a value that was never
// actually computed. Flagged in chat; worth fixing the type file or the
// backend, your call which.

import { useClassificationReport } from '@/lib/hooks/use-reports';
import { ReportFilters, ReportFiltersState, useReportDateFilters } from '@/components/forms/report-filters';
import { downloadReportCsv } from '@/lib/reports/download-csv';
import { PermissionGate } from '@/components/permission-gate';
import { ReportsNav } from '@/components/reports-nav';
import { Card, CardContent } from '@/components/ui/card';

function formatPercent(ratio: number | null): string {
  return ratio === null ? '—' : `${(ratio * 100).toFixed(1)}%`;
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

function ClassificationContent() {
  const [filters, setFilters] = useReportDateFilters();
  const { data, isLoading, isError } = useClassificationReport({ from: filters.from, to: filters.to });

  function handleFiltersChange(next: ReportFiltersState) {
    if (next.format === 'csv') {
      void downloadReportCsv('/reports/classification', { from: next.from, to: next.to }, 'classification');
      return;
    }
    setFilters(next);
  }

  return (
    <div className="p-6 space-y-6">
      <ReportsNav />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
        Classification
      </h1>

      <ReportFilters
        title="Filters"
        description="Filter by request creation date."
        initial={filters}
        onChange={handleFiltersChange}
      />

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load the classification report.</p>}

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total" value={data.total} />
          <StatCard label="Pending" value={data.pending} />
          <StatCard label="Classified (NLP)" value={data.nlpCount} />
          <StatCard label="Classified (HITL)" value={data.hitlCount} />
          <StatCard label="NLP share" value={formatPercent(data.nlpShare)} />
          <StatCard label="HITL rate" value={formatPercent(data.hitlRate)} />
          <StatCard
            label="Avg confidence"
            value={data.avgConfidence !== null ? data.avgConfidence.toFixed(2) : '—'}
          />
          <StatCard
            label="Avg confidence (NLP)"
            value={data.avgConfidenceNlp !== null ? data.avgConfidenceNlp.toFixed(2) : '—'}
          />
        </div>
      )}
    </div>
  );
}

export default function ClassificationReportPage() {
  return (
    <PermissionGate require="reports.view">
      <ClassificationContent />
    </PermissionGate>
  );
}