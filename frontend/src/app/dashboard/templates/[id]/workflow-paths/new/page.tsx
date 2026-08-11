'use client';
import { useParams } from 'next/navigation';
import { PermissionGate } from '@/components/permission-gate';
import { WorkflowPathForm } from '@/components/forms/workflow-path-form';

export default function NewWorkflowPathPage() {
  const params = useParams<{ id: string }>();

  return (
    <PermissionGate require="workflow.manage">
      <div className="p-6">
        {/* ASSUMES WorkflowPathForm accepts a templateId prop to lock/preselect
            the template. Not yet confirmed against the current file — send it
            and I'll adjust this and the form together if it still uses its own
            internal template dropdown instead. */}
        <WorkflowPathForm templateId={params.id} />
      </div>
    </PermissionGate>
  );
}