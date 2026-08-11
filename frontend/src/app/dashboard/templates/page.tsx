'use client';
import Link from 'next/link';
import { useTemplates } from '@/lib/hooks/use-template';
import { PermissionGate } from '@/components/permission-gate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

function TemplatesPageContent() {
  const { data: templates, isLoading } = useTemplates(true); // includeInactive=true

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Link href="/dashboard/templates/new">
          <Button>+ New Template</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !templates || templates.length === 0 ? (
        <p className="text-muted-foreground">No templates yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id} className={!t.isActive ? 'bg-muted/60 text-muted-foreground' : ''}>
                <TableCell>
                  {t.nameAr}
                  {t.nameEn && <span className="text-muted-foreground"> ({t.nameEn})</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={t.isActive ? 'default' : 'secondary'}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/templates/${t.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Link href={`/dashboard/templates/${t.id}/fields`}>
                    <Button variant="outline" size="sm">Manage Fields</Button>
                  </Link>
                  <Link href={`/dashboard/templates/${t.id}/eligibility`}>
                    <Button variant="outline" size="sm">Manage Eligibility</Button>
                  </Link>
                  <Link href={`/dashboard/templates/${t.id}/workflow-paths`}>
                      <Button variant="outline" size="sm">Workflow Paths</Button>
                    </Link>
                </TableCell>
                    
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <PermissionGate require="template.manage">
      <TemplatesPageContent />
    </PermissionGate>
  );
}