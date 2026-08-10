'use client';
import { useParams } from 'next/navigation';
import { useTemplate } from '@/lib/hooks/use-template';
import { PermissionGate } from '@/components/permission-gate';
import { TemplateForm } from '@/components/forms/template-form';

function EditTemplateContent() {
  const params = useParams<{ id: string }>();
  const { data: template, isLoading, isError } = useTemplate(params.id);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (isError || !template) return <p className="p-6 text-destructive">Template not found.</p>;

  return (
    <div className="p-6">
      <TemplateForm existing={template} />
    </div>
  );
}

export default function EditTemplatePage() {
  return (
    <PermissionGate require="template.manage">
      <EditTemplateContent />
    </PermissionGate>
  );
}