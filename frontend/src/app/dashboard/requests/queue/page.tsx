'use client';
//frontend\src\app\dashboard\requests\queue\page.tsx
import { useEffect, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { requestsApi } from '@/lib/api/requests';
import { requestKeys } from '@/lib/hooks/use-requests';
import { PermissionGate } from '@/components/permission-gate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  ClassificationStatus,
  ListQueueDto,
  RequestStatus,
  RequestSummaryView,
} from '@/types/request';

const selectClass =
  'flex h-10 min-w-44 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring';

type TriState = 'true' | 'false' | undefined;
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const stageStyles: Record<string, { variant: BadgeVariant; className?: string }> = {
  AWAITING_CLASSIFICATION: {
    variant: 'outline',
    className: 'border-[var(--ics-accent)] text-[var(--ics-text)]',
  },
  IN_HUMAN_REVIEW: {
    variant: 'secondary',
    className: 'bg-[var(--ics-secondary)]/30 text-[var(--ics-text)]',
  },
  AWAITING_CONFIRMATION: {
    variant: 'secondary',
    className: 'bg-[var(--ics-secondary)]/30 text-[var(--ics-text)]',
  },
  READY_TO_START: {
    variant: 'secondary',
    className: 'bg-[var(--ics-secondary)]/40 text-[var(--ics-text)]',
  },
  IN_PROGRESS: { variant: 'default', className: 'bg-[var(--ics-primary)] text-white' },
  ON_HOLD: { variant: 'outline', className: 'text-muted-foreground' },
  COMPLETED: { variant: 'default', className: 'bg-[var(--ics-accent)] text-white' },
  REJECTED: { variant: 'destructive' },
  CANCELLED: { variant: 'ghost', className: 'text-muted-foreground' },
};

const slaRiskStyles: Record<string, { variant: BadgeVariant; className?: string }> = {
  ON_TRACK: {
    variant: 'secondary',
    className: 'bg-[var(--ics-secondary)]/30 text-[var(--ics-text)]',
  },
  AT_RISK: {
    variant: 'secondary',
    className: 'bg-[var(--ics-secondary)]/60 text-[var(--ics-text)]',
  },
  BREACHED: { variant: 'destructive' },
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

function BooleanPairFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
}) {
  const toggle = (option: 'true' | 'false') => (checked: boolean) => {
    if (checked) onChange(option);
    else if (value === option) onChange(undefined);
  };
  return (
    <div className="space-y-1">
      <p className="text-sm leading-none font-medium text-(--ics-text)/70">{label}</p>
      <div className="flex items-center gap-5">
        <label className="flex cursor-pointer items-center gap-1.5 text-sm">
          <Checkbox checked={value === 'true'} onCheckedChange={toggle('true')} />
          Yes
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-sm">
          <Checkbox checked={value === 'false'} onCheckedChange={toggle('false')} />
          No
        </label>
      </div>
    </div>
  );
}

function RequestQueueContent() {
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.IN_PROGRESS);
  const [classificationStatus, setClassificationStatus] = useState<ClassificationStatus | ''>('');
  const [hasFilledData, setHasFilledData] = useState<TriState>(undefined);
  const [extracted, setExtracted] = useState<TriState>(undefined);
  const [limitInput, setLimitInput] = useState('');
  const [limit, setLimit] = useState('');
  // Every cursor that has been requested so far; null is page one.
  const [loadedCursors, setLoadedCursors] = useState<(string | null)[]>([null]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseParams: Omit<ListQueueDto, 'cursor'> = {
    status,
    classificationStatus: classificationStatus || undefined,
    hasFilledData,
    extracted,
    limit: limit || undefined,
  };

  const pages = useQueries({
    queries: loadedCursors.map((cursor) => ({
      queryKey: requestKeys.queue({ ...baseParams, cursor: cursor ?? undefined }),
      queryFn: () => requestsApi.getQueue({ ...baseParams, cursor: cursor ?? undefined }),
    })),
  });

  function resetList() {
    setLoadedCursors([null]);
  }

  function handleLimitChange(raw: string) {
    setLimitInput(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLimit(raw);
      resetList();
    }, 400);
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const rows: RequestSummaryView[] = pages.flatMap(
    (page) => page.data?.items ?? []
  );
  const isFetching = pages.some((page) => page.isFetching);
  const firstError = pages.find((page) => page.isError);
  const lastPage = pages[pages.length - 1];
  const nextCursor = lastPage?.data?.nextCursor ?? null;
  const loadingFirstPage = isFetching && rows.length === 0;

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-(--ics-text)">Request Queue</h1>
        <p className="text-sm text-muted-foreground">
          Work queue ordered by priority, then SLA urgency, then nearest deadline.
        </p>
      </div>

      <div className="rounded-xl border border-(--ics-primary)/15 bg-(--ics-secondary)/10 p-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className={selectClass}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as RequestStatus);
                resetList();
              }}
            >
              {Object.values(RequestStatus).map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="classificationStatus">Classification</Label>
            <select
              id="classificationStatus"
              className={selectClass}
              value={classificationStatus}
              onChange={(e) => {
                setClassificationStatus(e.target.value as ClassificationStatus | '');
                resetList();
              }}
            >
              <option value="">All</option>
              {Object.values(ClassificationStatus).map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </select>
          </div>

          <BooleanPairFilter
            label="Has filled data"
            value={hasFilledData}
            onChange={(v) => {
              setHasFilledData(v);
              resetList();
            }}
          />

          <BooleanPairFilter
            label="Extracted"
            value={extracted}
            onChange={(v) => {
              setExtracted(v);
              resetList();
            }}
          />

          <div className="space-y-1">
            <Label htmlFor="limit">Limit</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={200}
              placeholder="50"
              value={limitInput}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="w-28"
            />
          </div>
        </div>
      </div>

      {firstError ? (
        <p className="text-sm text-destructive">
          {firstError.error instanceof Error
            ? firstError.error.message
            : 'Failed to load the queue.'}
        </p>
      ) : loadingFirstPage ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No requests in the queue for these filters.
        </p>
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>SLA Risk</TableHead>
                <TableHead>SLA Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const stage = stageStyles[row.stage] ?? { variant: 'outline' as BadgeVariant };
                const risk = slaRiskStyles[row.slaRisk] ?? { variant: 'secondary' as BadgeVariant };
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">
                      {row.referenceNo ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stage.variant} className={stage.className}>
                        {titleCase(row.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {titleCase(row.classificationStatus)}
                      {row.classificationConfidence != null && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({Math.round(row.classificationConfidence * 100)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{titleCase(row.priority)}</TableCell>
                    <TableCell>
                      <Badge variant={risk.variant} className={risk.className}>
                        {titleCase(row.slaRisk)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.slaDueAt ? (
                        <span title={new Date(row.slaDueAt).toLocaleString()}>
                          {formatDate(row.slaDueAt)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {rows.length} shown{isFetching ? ' · refreshing…' : ''}
            </p>
            {nextCursor && (
              <Button
                onClick={() => setLoadedCursors((prev) => [...prev, nextCursor])}
                disabled={isFetching}
                className="bg-(--ics-primary) text-white hover:bg-[#2f5636]"
              >
                {isFetching ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestQueuePage() {
  return (
    <PermissionGate require={['request.read', 'request.classify']}>
      <RequestQueueContent />
    </PermissionGate>
  );
}