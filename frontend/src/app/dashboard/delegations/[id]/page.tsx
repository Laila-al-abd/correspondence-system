'use client';
// src/app/dashboard/delegations/[id]/page.tsx
//
// Detail view for a single delegation. Uses useParams() per this project's
// convention rather than a params prop, to sidestep any async-params
// ambiguity elsewhere in this Next.js version.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDelegation } from '@/lib/hooks/use-delegations';
import { PermissionGate } from '@/components/permission-gate';
import { DelegationRevokeButton } from '@/components/forms/delegation-revoke-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function DelegationDetailContent() {
  const params = useParams<{ id: string }>();
  const { data: delegation, isLoading, isError } = useDelegation(params.id);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (isError || !delegation)
    return <p className="p-6 text-destructive">Delegation not found.</p>;

  return (
    <div className="p-6 space-y-4">
      <Link
        href="/dashboard/delegations"
        className="text-sm font-medium hover:underline"
        style={{ color: 'var(--ics-accent)' }}
      >
        ← Back to delegations
      </Link>

      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle style={{ color: 'var(--ics-primary)' }}>
              Delegation details
            </CardTitle>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{
                backgroundColor: delegation.isActive
                  ? 'var(--ics-primary)'
                  : 'color-mix(in srgb, var(--ics-text) 35%, transparent)',
              }}
            >
              {delegation.isActive ? 'Active' : 'Revoked'}
            </span>
          </div>
          {delegation.isActive && <DelegationRevokeButton delegationId={delegation.id} />}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Delegator
            </p>
            <p>
              {delegation.delegatorName.ar}
              {delegation.delegatorName.en && ` (${delegation.delegatorName.en})`}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Delegate
            </p>
            <p>
              {delegation.delegateName.ar}
              {delegation.delegateName.en && ` (${delegation.delegateName.en})`}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Start date
              </p>
              <p>{formatDate(delegation.startDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                End date
              </p>
              <p>{formatDate(delegation.endDate)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Reason
            </p>
            <p>{delegation.reason ?? 'No reason given.'}</p>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Created {formatDate(delegation.createdAt)} · ID: {delegation.id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DelegationDetailPage() {
  return (
    <PermissionGate require="user.manage">
      <DelegationDetailContent />
    </PermissionGate>
  );
}