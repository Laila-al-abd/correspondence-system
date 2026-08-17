'use client';
// src/app/dashboard/users/page.tsx
//
// Permission: 'user.manage' -- class-level @RequirePermissions('user.manage')
// on UsersController covers list/detail. Assign/revoke role additionally
// requires 'role.manage' -- handled inline on the roles sub-page, not here.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/lib/hooks/use-users';
import { useSyncUsersFromDirectory } from '@/lib/hooks/use-users';
import { useUpdateUserStatus } from '@/lib/hooks/use-users';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

/**
 * The message the server actually sent, when it sent one.
 *
 * A sync can fail for reasons only the server knows -- the directory is
 * unreachable, a unit type is unmapped, a user type cannot be imported -- and
 * every one of those arrives as a sentence in the error body. Swallowing it and
 * printing "please try again" turns a diagnosable failure into a mystery.
 */
function syncErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

function SyncFromDirectoryControl() {
  const sync = useSyncUsersFromDirectory();
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | null>(null);
  // SyncUsersResponse's exact fields aren't confirmed on the frontend (see
  // caveat in chat) -- dumped raw rather than destructured, so this doesn't
  // depend on guessing field names correctly.
  const [result, setResult] = useState<unknown>(null);

  async function handleSync(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const data = await sync.mutateAsync(source.trim() || undefined);
      setResult(data);
    } catch (err) {
      // Also logged: a CORS or network failure never reaches the body above,
      // and the browser console is the only place it can be read.
      console.error('User sync failed', err);
      setError(syncErrorMessage(err, 'Sync failed. Please try again.'));
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSync} className="flex items-center gap-2">
        <Button type="submit" variant="outline" disabled={sync.isPending}>
          {sync.isPending ? 'Syncing…' : 'Sync from directory'}
        </Button>
        <Input
          type="text"
          placeholder="Source label (optional)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={sync.isPending}
          maxLength={100}
          className="w-56 h-9"
        />
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result != null && (
        <pre className="text-xs bg-muted rounded-md p-2 max-w-xl overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function statusBadge(status: string) {
  const active = status === 'ACTIVE';
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{
        backgroundColor: active
          ? 'var(--ics-primary)'
          : 'color-mix(in srgb, var(--ics-text) 35%, transparent)',
      }}
    >
      {status}
    </span>
  );
}

const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED', 'INACTIVE'] as const;

/**
 * Until now the Status column was a label for an intention rather than a
 * control: login already refuses a non-ACTIVE account and step routing already
 * skips one, but nothing could write the value after the account was created.
 *
 * Suspension is not something to do by a stray click, so the change is
 * confirmed first; and the server's own refusal -- the administrative floor,
 * when this is the last account that can manage users -- is shown verbatim
 * rather than replaced by a generic failure message.
 */
function StatusControl({ userId, status }: { userId: string; status: string }) {
  const update = useUpdateUserStatus();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: string) {
    if (next === status) return;
    setError(null);
    const consequence =
      next === 'ACTIVE'
        ? 'They will be able to sign in and receive steps again.'
        : 'They will no longer be able to sign in, and new steps will route to somebody else.';
    if (!window.confirm(`Set this account to ${next}? ${consequence}`)) return;
    try {
      await update.mutateAsync({
        userId,
        status: next as 'ACTIVE' | 'SUSPENDED' | 'INACTIVE',
      });
    } catch (e) {
      const message = (e as { message?: string } | null)?.message;
      setError(message ?? 'Could not change the status.');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        aria-label="Account status"
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={update.isPending}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-destructive max-w-64 text-right">{error}</span>
      )}
    </div>
  );
}

function UsersPageContent() {
  const router = useRouter();
  const { data, isLoading, isError } = useUsers(1, 50);
  const users = data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      <SyncFromDirectoryControl />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
          Users
        </h1>
        <Button
          onClick={() => router.push('/dashboard/users/new')}
          className="text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--ics-primary)' }}
        >
          Create User
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load users.</p>}
      {!isLoading && !isError && users.length === 0 && (
        <p className="text-muted-foreground">No users yet.</p>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Institutional #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  {u.fullNameAr}
                  {u.fullNameEn && ` (${u.fullNameEn})`}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.userType}</TableCell>
                <TableCell>{u.institutionalNumber ?? '—'}</TableCell>
                <TableCell>{statusBadge(u.status)}</TableCell>
                <TableCell>{formatDate(u.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/users/${u.id}/roles`)}
                    >
                      Manage Roles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/users/${u.id}/attributes`)}
                    >
                      Manage Attributes
                    </Button>
                    <StatusControl userId={u.id} status={u.status} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <PermissionGate require="user.manage">
      <UsersPageContent />
    </PermissionGate>
  );
}