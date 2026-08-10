'use client';
// src/components/forms/report-filters.tsx
//
// Reusable filter controls for all report query parameters.
// All report endpoints are GET (read-only) — these are query parameter controls,
// not mutation forms. They update the TanStack Query params via the parent component.
//
// Query params (from ReportQueryDto / VolumeQueryDto):
// - from: optional ISO 8601 date
// - to: optional ISO 8601 date
// - format: 'json' | 'csv' (defaults to 'json'; csv triggers download)
// - groupBy: 'day' | 'week' | 'month' (volume report only, defaults to 'day')

import type { ReactNode } from 'react';
import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

export interface ReportFiltersProps {
  /** Called when filters change — parent should update its query params. */
  onChange: (filters: ReportFiltersState) => void;
  /** Initial filter values (from URL or defaults). */
  initial?: Partial<ReportFiltersState>;
  /** Whether to show groupBy selector (only for volume report). Default: false. */
  showGroupBy?: boolean;
  /** Optional custom title. */
  title?: string;
  /** Optional custom description. */
  description?: string;
  /** Optional submit button label (for explicit apply). */
  submitLabel?: string;
  /** If true, auto-apply on change (no submit button). Default: false. */
  autoApply?: boolean;
  /** Children rendered after the filters (e.g., export button). */
  children?: ReactNode;
}

export interface ReportFiltersState {
  from?: string;     // ISO date string (YYYY-MM-DD)
  to?: string;       // ISO date string (YYYY-MM-DD)
  format: 'json' | 'csv';
  groupBy: 'day' | 'week' | 'month';
}

// Default values matching backend defaults
const DEFAULT_GROUP_BY: 'day' | 'week' | 'month' = 'day';
const DEFAULT_FORMAT: 'json' | 'csv' = 'json';

export function ReportFilters({
  onChange,
  initial,
  showGroupBy = false,
  title = 'Report Filters',
  description,
  submitLabel = 'Apply',
  autoApply = false,
  children,
}: ReportFiltersProps) {
  const [from, setFrom] = useState<string>(initial?.from ?? '');
  const [to, setTo] = useState<string>(initial?.to ?? '');
  const [format, setFormat] = useState<'json' | 'csv'>(initial?.format ?? DEFAULT_FORMAT);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>(initial?.groupBy ?? DEFAULT_GROUP_BY);

  // Notify parent on change (debounced if autoApply)
  useEffect(() => {
    if (autoApply) {
      const timer = setTimeout(() => {
        onChange({ from, to, format, groupBy });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [from, to, format, groupBy, autoApply, onChange]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onChange({ from, to, format, groupBy });
  }

  function handleCsvDownload() {
    onChange({ from, to, format: 'csv', groupBy });
  }

  function handleClear() {
    setFrom('');
    setTo('');
    setFormat(DEFAULT_FORMAT);
    setGroupBy(DEFAULT_GROUP_BY);
    onChange({ from: '', to: '', format: DEFAULT_FORMAT, groupBy: DEFAULT_GROUP_BY });
  }

  const hasActiveFilters = !!from || !!to || format !== DEFAULT_FORMAT || (showGroupBy && groupBy !== DEFAULT_GROUP_BY);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="from">From date (optional)</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                max={to || undefined}
              />
              <p className="text-xs text-muted-foreground">Inclusive start date (ISO 8601)</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="to">To date (optional)</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                min={from || undefined}
              />
              <p className="text-xs text-muted-foreground">Inclusive end date (ISO 8601)</p>
            </div>
          </div>

          {showGroupBy && (
            <>
              <Separator />
              {/* Group by — volume report only */}
              <div className="space-y-1">
                <Label htmlFor="groupBy">Group by (volume report)</Label>
                <select
                  id="groupBy"
                  className={selectClass}
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
                <p className="text-xs text-muted-foreground">Bucket size for the time series.</p>
              </div>
            </>
          )}

          <Separator />

          {/* Format selector */}
          <div className="space-y-1">
            <Label htmlFor="format">Output format</Label>
            <div className="flex items-center gap-3">
              <select
                id="format"
                className={selectClass}
                value={format}
                onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="json">JSON (view in browser)</option>
                <option value="csv">CSV (download spreadsheet)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                CSV triggers a file download with the current filters applied.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!autoApply && (
              <Button type="submit" className={hasActiveFilters ? '' : 'bg-muted'}>
                {submitLabel}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCsvDownload}
              disabled={format === 'csv'}
            >
              Download CSV
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Clear filters
              </Button>
            )}
            {children}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Convenience hooks for common report filter combinations ---

/**
 * Minimal date-range filter for overview, paths, steps, classification reports.
 * Usage:
 *   const [filters, setFilters] = useReportDateFilters();
 *   const { data } = useOverviewReport({ from: filters.from, to: filters.to, format: filters.format });
 */
export function useReportDateFilters() {
  const [filters, setFilters] = useState<ReportFiltersState>({
    from: '',
    to: '',
    format: DEFAULT_FORMAT,
    groupBy: DEFAULT_GROUP_BY,
  });
  return [filters, setFilters] as const;
}

/**
 * Volume report filter with groupBy.
 * Usage:
 *   const [filters, setFilters] = useVolumeReportFilters();
 *   const { data } = useVolumeReport({
 *     from: filters.from,
 *     to: filters.to,
 *     format: filters.format,
 *     groupBy: filters.groupBy
 *   });
 */
export function useVolumeReportFilters() {
  const [filters, setFilters] = useState<ReportFiltersState>({
    from: '',
    to: '',
    format: DEFAULT_FORMAT,
    groupBy: DEFAULT_GROUP_BY,
  });
  return [filters, setFilters] as const;
}