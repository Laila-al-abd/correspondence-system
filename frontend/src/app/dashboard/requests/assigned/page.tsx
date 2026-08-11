'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignedRequests } from '@/lib/hooks/use-requests';
import { RequestSummaryView, ListAssignedDto } from '@/types/request';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

function stageBadgeVariant(stage: string): 'default' | 'secondary' {
  if (stage === 'COMPLETED' || stage === 'REJECTED' || stage === 'CANCELLED') return 'secondary';
  return 'default';
}

function AssignedRequestsContent() {
  const router = useRouter();
  const [readyOnly, setReadyOnly] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const queryParams: ListAssignedDto = {
    ready: readyOnly,
    cursor,
  };

  const { data, isLoading, refetch } = useAssignedRequests(queryParams);
  const items = data?.items ?? [];

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--ics-text)">Assigned Requests</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={readyOnly === 'true' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setReadyOnly(readyOnly === 'true' ? undefined : 'true');
              setCursor(undefined);
            }}
          >
            Ready Only
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <p className="text-muted-foreground">Loading assigned requests…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No requests are currently assigned to you.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference #</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>SLA Risk</TableHead>
                <TableHead>SLA Due</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req) => (
                <TableRow
                  key={req.id}
                  onClick={() => router.push(`/dashboard/requests/${req.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{req.referenceNo ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={stageBadgeVariant(req.stage)}>{req.stage}</Badge>
                  </TableCell>
                  <TableCell>{req.priority}</TableCell>
                  <TableCell>{req.slaRisk}</TableCell>
                  <TableCell>{req.slaDueAt ? new Date(req.slaDueAt).toLocaleString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/requests/${req.id}`);
                    }}>
                      View & Act
                    </Button>
                  </TableCell>
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

export default function AssignedRequestsPage() {
  return (
    <PermissionGate require="request.act">
      <AssignedRequestsContent />
    </PermissionGate>
  );
}