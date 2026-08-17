'use client';
// src/components/forms/department-sync-button.tsx
//
// Inline sync button for departments from external directory.
// POST /organization/departments/sync
//
// Single-field, low-complexity mutation (optional source string) → small inline control.
// Uses the standard inline error pattern.

import type { ReactNode } from 'react';
import { useState, FormEvent } from 'react';
import { useSyncDepartments } from '@/lib/hooks/use-organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful sync. */
  onSuccess?: () => void;
  /** Optionally show as a full form with source input, rather than just a button. */
  showSourceInput?: boolean;
}

/** See the same helper in dashboard/users/page.tsx: show the server's reason. */
function syncErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

export function DepartmentSyncButton({
  children,
  className,
  onSuccess,
  showSourceInput = false,
}: Props) {
  const syncDepartments = useSyncDepartments();
  const [source, setSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await syncDepartments.mutateAsync(source.trim() || undefined);
      setShowForm(false);
      setSource('');
      onSuccess?.();
    } catch (err) {
      console.error('Department sync failed', err);
      setError(
        syncErrorMessage(err, 'Failed to sync departments. Please try again.'),
      );
    }
  }

  function handleClick() {
    if (syncDepartments.isPending) return;
    if (showSourceInput) {
      setShowForm(true);
    } else {
      // Just sync with no source override
      handleSubmit(new Event('submit') as any);
    }
  }

  // If showSourceInput is true and not showing form, render trigger button
  if (showSourceInput && !showForm) {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={syncDepartments.isPending}
        className={className}
      >
        {syncDepartments.isPending ? '⏳ Syncing…' : children ?? 'Sync Departments'}
      </Button>
    );
  }

  // If showing form, render inline form with source input
  if (showSourceInput && showForm) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Source label (optional)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={syncDepartments.isPending}
          maxLength={100}
          className="w-64"
        />
        <Button
          type="submit"
          disabled={syncDepartments.isPending}
          size="sm"
        >
          {syncDepartments.isPending ? '⏳' : 'Sync'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setShowForm(false); setSource(''); setError(null); }}
          disabled={syncDepartments.isPending}
        >
          Cancel
        </Button>
        {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
      </form>
    );
  }

  // Default: just a button (no source input)
  return (
    <Button
      variant={showSourceInput ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={syncDepartments.isPending}
      className={className}
    >
      {syncDepartments.isPending ? '⏳ Syncing…' : children ?? 'Sync Departments'}
    </Button>
  );
}