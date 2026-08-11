'use client';
import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTemplate } from '@/lib/hooks/use-template';
import { useWorkflowPaths } from '@/lib/hooks/use-workflow';
import { PermissionGate } from '@/components/permission-gate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ActivateWorkflowPathButton } from '@/components/forms/activate-workflow-path-button';
import { DeactivateWorkflowPathButton } from '@/components/forms/deactivate-workflow-path-button';
import { WorkflowPathView } from '@/types/workflow';

function StepsTable({ path }: { path: WorkflowPathView }) {
  const nameById = new Map(path.steps.map((s) => [s.id, s.name.ar]));
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>SLA (hrs)</TableHead>
            <TableHead>Depends on</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {path.steps.map((step, i) => (
            <TableRow key={step.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{step.name.ar}{step.name.en && ` (${step.name.en})`}</TableCell>
              <TableCell className="text-xs">{step.assigneeType}</TableCell>
              <TableCell>{step.slaHours ?? '—'}</TableCell>
              <TableCell className="text-xs">
                {step.dependsOnStepIds.length === 0
                  ? '—'
                  : step.dependsOnStepIds.map((id) => nameById.get(id) ?? id).join(', ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function WorkflowPathsContent() {
  const params = useParams<{ id: string }>();
  const templateId = params.id;
  const { data: template } = useTemplate(templateId);
  const { data: paths, isLoading } = useWorkflowPaths(templateId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Active path first; stable sort preserves API order among the rest.
  const sorted = paths ? [...paths].sort((a, b) => Number(b.isActive) - Number(a.isActive)) : [];

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workflow Paths</h1>
          {template && (
            <p className="text-sm text-muted-foreground">
              {template.nameAr}{template.nameEn && ` (${template.nameEn})`}
            </p>
          )}
        </div>
        <Link href={`/dashboard/templates/${templateId}/workflow-paths/new`}>
          <Button>+ Define New Path</Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        A path can never be edited directly — revising a workflow means defining a new path and
        activating it, which retires the previous one instead of erasing it. Only one path is
        active at a time.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">No workflow paths defined yet for this template.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((path) => (
              <Fragment key={path.id}>
                <TableRow className={!path.isActive ? 'text-muted-foreground' : ''}>
                  <TableCell>
                    <button onClick={() => toggle(path.id)} className="text-left hover:underline">
                      {expanded.has(path.id) ? '▾' : '▸'}{' '}
                      {path.name.ar}{path.name.en && ` (${path.name.en})`}
                    </button>
                  </TableCell>
                  <TableCell>{path.steps.length}</TableCell>
                  <TableCell>
                    <Badge variant={path.isActive ? 'default' : 'secondary'}>
                      {path.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {path.isActive ? (
                      <DeactivateWorkflowPathButton workflowPathId={path.id} />
                    ) : (
                      <ActivateWorkflowPathButton workflowPathId={path.id} />
                    )}
                  </TableCell>
                </TableRow>
                {expanded.has(path.id) && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <StepsTable path={path} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function WorkflowPathsPage() {
  return (
    <PermissionGate require="workflow.manage">
      <WorkflowPathsContent />
    </PermissionGate>
  );
}