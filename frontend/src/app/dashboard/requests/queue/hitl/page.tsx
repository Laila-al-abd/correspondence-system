'use client';
//frontend\src\app\dashboard\requests\queue\hitl\page.tsx
// Queue filtered server-side to items awaiting human classification.
// status: 'DRAFT' + classificationStatus: 'PENDING' | 'HITL' together select exactly the
// requests whose derived stage is IN_HUMAN_REVIEW (see request-stage.ts) —
// server-side so client-side filtering doesn't hide rows past the current cursor.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHitlQueue } from '@/lib/hooks/use-requests';
import { RequestSummaryView } from '@/types/request';
import { PermissionGate } from '@/components/permission-gate';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatSlaRisk } from '@/lib/format/duration';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

function HitlQueueContent() {
  const router = useRouter();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<RequestSummaryView[]>([]);

  const { data, isLoading, isError, error, refetch } = useHitlQueue(50, cursor);

  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      const fresh = data.items.filter((r) => !seen.has(r.id));
      return cursor ? [...prev, ...fresh] : data.items;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Classification Queue</h1>
        <p className="text-sm text-muted-foreground">
          Requests the classifier couldn't confidently place — pick the right template and fill
          what you can.
        </p>
      </div>

      {isLoading && items.length === 0 ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load classification queue: {error?.message ?? 'Unknown error'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Nothing waiting for review right now.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference #</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline status</TableHead>
                <TableHead>Deadline of step in progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req) => (
                <TableRow
                  key={req.id}
                  onClick={() => router.push(`/dashboard/requests/queue/hitl/${req.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>{req.referenceNo ?? '—'}</TableCell>
                  <TableCell><Badge>{req.priority}</Badge></TableCell>
                  <TableCell>{formatSlaRisk(req.slaRisk)}</TableCell>
                  <TableCell>{req.slaDueAt ? new Date(req.slaDueAt).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data?.nextCursor && (
            <Button variant="outline" onClick={() => setCursor(data.nextCursor!)}>
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default function RequestQueuePage() {
  return (
    <PermissionGate require={['request.read', 'request.classify']}>
      <HitlQueueContent />
    </PermissionGate>
  );
}
