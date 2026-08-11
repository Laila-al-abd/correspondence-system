'use client';
//frontend\src\app\dashboard\requests\queue\hitl\page.tsx
// Queue filtered server-side to items awaiting human classification.
// status: 'DRAFT' + classificationStatus: 'HITL' together select exactly the
// requests whose derived stage is IN_HUMAN_REVIEW (see request-stage.ts) —
// filtered via the real backend query param, not client-side, since this
// list is keyset-paginated and a client-side filter would silently hide
// matching rows sitting past the current cursor.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestQueue } from '@/lib/hooks/use-requests';
import { RequestStatus, RequestSummaryView, ClassificationStatus } from '@/types/request';
import { PermissionGate } from '@/components/permission-gate';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

function HitlQueueContent() {
  const router = useRouter();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<RequestSummaryView[]>([]);

  const { data, isLoading } = useRequestQueue({
    status: RequestStatus.DRAFT,
    classificationStatus: ClassificationStatus.HITL,
    limit: '50',
    cursor,
  });

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
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Nothing waiting for review right now.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference #</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>SLA Risk</TableHead>
                <TableHead>SLA Due</TableHead>
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
                  <TableCell>{req.slaRisk}</TableCell>
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
