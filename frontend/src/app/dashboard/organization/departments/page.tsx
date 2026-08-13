'use client';
// src/app/dashboard/organization/departments/page.tsx
//
// The organization chart: every org unit, in hierarchy order.
//
// Permission: 'user.manage' -- OrganizationController carries a class-level
// @RequirePermissions('user.manage'), so every route behind this page needs it.
//
// This page renders the TREE (GET /organization/departments/tree) rather than
// the flat list, because hierarchy is not decoration here: REQUESTER_FACULTY_DEAN
// steps resolve by walking parent links upward until they hit a FACULTY, and
// resolveUpwards escalates the same way when a department has no eligible
// holder. A unit parented to the wrong branch routes silently to the wrong
// person, and the only way to catch that is to see the shape.
//
// Each row exposes a copy-id control. Department UUIDs are needed by hand when
// assigning a department-scoped role (POST /users/:id/roles takes departmentId),
// and that scoping -- not the user's own department -- is what step routing
// actually matches on.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartmentTree } from '@/lib/hooks/use-organization';
import { PermissionGate } from '@/components/permission-gate';
import { DepartmentSyncButton } from '@/components/forms/department-sync-button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { DepartmentTreeNode } from '@/types/organization';

interface FlatRow {
  node: DepartmentTreeNode;
  depth: number;
}

/** Depth-first walk, so rows arrive in the order the chart reads. */
function flatten(nodes: DepartmentTreeNode[], depth = 0): FlatRow[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flatten(node.children ?? [], depth + 1),
  ]);
}

function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access is refused over plain http on some browsers. The id
      // is already on screen, so selecting it by hand still works.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={id}
      className="font-mono text-xs text-muted-foreground hover:underline"
    >
      {copied ? 'copied' : `${id.slice(0, 8)}…`}
    </button>
  );
}

function DepartmentsPageContent() {
  const router = useRouter();
  // activeOnly is deliberately false: the directory sync deactivates units it
  // no longer sends rather than deleting them, and hiding them here would make
  // that pass invisible.
  const { data: tree, isLoading, isError } = useDepartmentTree(false);
  const rows = flatten(tree ?? []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
          Departments
        </h1>
        <div className="flex items-center gap-2">
          <DepartmentSyncButton showSourceInput />
          <Button
            onClick={() => router.push('/dashboard/organization/departments/new')}
            className="text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--ics-primary)' }}
          >
            Add Department
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load departments.</p>}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground">No departments yet.</p>
          <p className="text-sm text-muted-foreground">
            Start with a root unit (no parent) — a UNIVERSITY — then hang faculties
            and departments beneath it. Or import the whole chart at once with
            Sync Departments.
          </p>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ node, depth }) => (
              <TableRow key={node.id} style={node.isActive ? undefined : { opacity: 0.55 }}>
                <TableCell>
                  <span style={{ paddingInlineStart: `${depth * 1.25}rem` }}>
                    {depth > 0 && (
                      <span className="text-muted-foreground" aria-hidden="true">
                        └&nbsp;
                      </span>
                    )}
                    {node.name.ar}
                    {node.name.en && (
                      <span className="text-muted-foreground"> ({node.name.en})</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: 'var(--ics-accent)' }}
                  >
                    {node.unitType.code}
                  </span>
                </TableCell>
                <TableCell>
                  {node.isActive ? (
                    'Active'
                  ) : (
                    <span className="text-muted-foreground">Deactivated</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {node.externalId ? (
                    <span title={`external id: ${node.externalId}`}>{node.sourceSystem}</span>
                  ) : (
                    <span className="text-muted-foreground">Manual</span>
                  )}
                </TableCell>
                <TableCell>
                  <CopyIdButton id={node.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <PermissionGate require="user.manage">
      <DepartmentsPageContent />
    </PermissionGate>
  );
}
