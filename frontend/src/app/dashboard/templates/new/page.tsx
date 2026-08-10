import { PermissionGate } from '@/components/permission-gate';
import { TemplateForm } from '@/components/forms/template-form';

export default function NewTemplatePage() {
  return (
    <PermissionGate require="template.manage">
      <div className="p-6">
        <TemplateForm />
      </div>
    </PermissionGate>
  );
}