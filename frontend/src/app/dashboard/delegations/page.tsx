'use client';
// src/app/dashboard/delegations/page.tsx
//
// List of delegations. Permission: 'user.manage' -- confirmed from the
// class-level @RequirePermissions('user.manage') on DelegationsController,
// which applies to every route on that controller.

import { useRouter } from 'next/navigation';
import { useDelegations } from '@/lib/hooks/use-delegations';
import { PermissionGate } from '@/components/permission-gate';
import { DelegationRevokeButton } from '@/components/forms/delegation-revoke-button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function DelegationsPageContent() {
  const router = useRouter();
  // Simple table per the request -- no pagination controls yet. If the
  // list grows past this page size, add Prev/Next wired to page/pageSize.
  const { data, isLoading, isError } = useDelegations(1, 50);
  const delegations = data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
          Delegations
        </h1>
        <Button
          onClick={() => router.push('/dashboard/delegations/new')}
          className="text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--ics-primary)' }}
        >
          Add Delegation
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load delegations.</p>}

      {!isLoading && !isError && delegations.length === 0 && (
        <p className="text-muted-foreground">No delegations yet.</p>
      )}

      {!isLoading && !isError && delegations.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delegator</TableHead>
              <TableHead>Delegate</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>End date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegations.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/delegations/${d.id}`)}
              >
                <TableCell>
                  {d.delegatorName.ar}
                  {d.delegatorName.en && ` (${d.delegatorName.en})`}
                </TableCell>
                <TableCell>
                  {d.delegateName.ar}
                  {d.delegateName.en && ` (${d.delegateName.en})`}
                </TableCell>
                <TableCell>{formatDate(d.startDate)}</TableCell>
                <TableCell>{formatDate(d.endDate)}</TableCell>
                <TableCell className="max-w-48 truncate">
                  {d.reason ?? '—'}
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor: d.isActive
                        ? 'var(--ics-primary)'
                        : 'color-mix(in srgb, var(--ics-text) 35%, transparent)',
                    }}
                  >
                    {d.isActive ? 'Active' : 'Revoked'}
                  </span>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {/* Only offer revoke on a still-active delegation -- revoking
                      an already-revoked one has no meaningful action to confirm. */}
                  {d.isActive && <DelegationRevokeButton delegationId={d.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function DelegationsPage() {
  return (
    <PermissionGate require="user.manage">
      <DelegationsPageContent />
    </PermissionGate>
  );
}