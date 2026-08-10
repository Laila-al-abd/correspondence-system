'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTemplate, useUpsertTemplateField, useRemoveTemplateField } from '@/lib/hooks/use-template';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UpsertTemplateFieldDto, TemplateFieldOptionDto, TemplateFieldCatalogView, FieldDataType } from '@/types/catalog';

const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

function emptyFieldDraft(): UpsertTemplateFieldDto {
  return { key: '', labelAr: '', labelEn: '', dataType: FieldDataType.TEXT, isRequired: false, extractionQuestion: '', options: [] };
}

function fieldToDraft(field: TemplateFieldCatalogView): UpsertTemplateFieldDto {
  return {
    key: field.key,
    labelAr: field.labelAr,
    labelEn: field.labelEn ?? '',
    // dataType on the read model is a plain string (see TemplateFieldCatalogView);
    // this cast is safe because it only ever holds one of the FieldDataType values.
    dataType: field.dataType as FieldDataType,
    isRequired: field.isRequired,
    extractionQuestion: field.extractionQuestion ?? '',
    options: field.options.map((o) => ({ value: o.value, labelAr: o.labelAr, labelEn: o.labelEn ?? '' })),
  };
}

function FieldsManagementContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const templateId = params.id;
  const { data: template, isLoading } = useTemplate(templateId);
  const upsertField = useUpsertTemplateField(templateId);
  const removeField = useRemoveTemplateField(templateId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null); // null = adding new
  const [draft, setDraft] = useState<UpsertTemplateFieldDto>(emptyFieldDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  function openAddDialog() {
    setEditingKey(null);
    setDraft(emptyFieldDraft());
    setFormError(null);
    setDialogOpen(true);
  }
  function openEditDialog(field: TemplateFieldCatalogView) {
    setEditingKey(field.key);
    setDraft(fieldToDraft(field));
    setFormError(null);
    setDialogOpen(true);
  }
  function updateDraft(patch: Partial<UpsertTemplateFieldDto>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }
  function addOption() {
    setDraft((prev) => ({ ...prev, options: [...(prev.options ?? []), { value: '', labelAr: '', labelEn: '' }] }));
  }
  function removeOption(i: number) {
    setDraft((prev) => ({ ...prev, options: (prev.options ?? []).filter((_, idx) => idx !== i) }));
  }
  function updateOption(i: number, patch: Partial<TemplateFieldOptionDto>) {
    setDraft((prev) => ({ ...prev, options: (prev.options ?? []).map((o, idx) => (idx === i ? { ...o, ...patch } : o)) }));
  }

  async function handleSave() {
    setFormError(null);
    if (!draft.key.trim() || !draft.labelAr.trim()) {
      setFormError('Key and Arabic label are required.');
      return;
    }
    if (draft.dataType === FieldDataType.ENUM && (!draft.options || draft.options.length === 0)) {
      setFormError('An ENUM field needs at least one option.');
      return;
    }
    // Key is locked once a field exists — UpsertTemplateFieldHandler matches
    // by key, so sending a different key on "edit" would silently create a
    // second field instead of redefining this one.
    const payload: UpsertTemplateFieldDto = {
      ...draft,
      key: editingKey ?? draft.key.trim(),
      labelEn: draft.labelEn || undefined,
      extractionQuestion: draft.extractionQuestion || undefined,
      options: draft.options && draft.options.length > 0 ? draft.options : undefined,
    };
    try {
      await upsertField.mutateAsync(payload);
      setDialogOpen(false);
    } catch {
      setFormError('Failed to save the field. Please check the values and try again.');
    }
  }

  function handleCancelDialog() {
    setDialogOpen(false);
    setFormError(null);
  }

  async function handleConfirmDelete(key: string) {
    try {
      await removeField.mutateAsync(key);
    } finally {
      setConfirmDeleteKey(null);
    }
  }

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!template) return <p className="p-6 text-destructive">Template not found.</p>;

  const fields = [...template.fields].sort((a, b) => a.ordinal - b.ordinal);

  return (
    <div className="space-y-4 p-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Fields</h1>
          <p className="text-sm text-muted-foreground">
            {template.nameAr}{template.nameEn && ` (${template.nameEn})`}
          </p>
        </div>
        <Button onClick={openAddDialog}>+ Add Field</Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground">No fields defined yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.key}>
                <TableCell className="font-mono text-xs">{field.key}</TableCell>
                <TableCell>{field.labelAr}{field.labelEn && ` (${field.labelEn})`}</TableCell>
                <TableCell>{field.dataType}</TableCell>
                <TableCell>{field.isRequired ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(field)}>Edit</Button>
                  {confirmDeleteKey === field.key ? (
                    <>
                      <Button variant="destructive" size="sm" onClick={() => handleConfirmDelete(field.key)} disabled={removeField.isPending}>
                        {removeField.isPending ? 'Removing…' : 'Confirm?'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteKey(null)}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setConfirmDeleteKey(field.key)}>Delete</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingKey ? `Edit field "${editingKey}"` : 'Add field'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fieldKey">Key</Label>
              <Input
                id="fieldKey"
                value={draft.key}
                onChange={(e) => updateDraft({ key: e.target.value })}
                disabled={!!editingKey}
                maxLength={50}
              />
              {editingKey && <p className="text-xs text-muted-foreground">Key can't be changed after creation.</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="fieldLabelAr">Label (Arabic)</Label>
              <Input id="fieldLabelAr" value={draft.labelAr} onChange={(e) => updateDraft({ labelAr: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fieldLabelEn">Label (English)</Label>
              <Input id="fieldLabelEn" value={draft.labelEn ?? ''} onChange={(e) => updateDraft({ labelEn: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fieldDataType">Data type</Label>
              <select id="fieldDataType" className={selectClass} value={draft.dataType} onChange={(e) => updateDraft({ dataType: e.target.value as FieldDataType })}>
                {Object.values(FieldDataType).map((dt) => (<option key={dt} value={dt}>{dt}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fieldRequired" checked={draft.isRequired ?? false} onChange={(e) => updateDraft({ isRequired: e.target.checked })} />
              <Label htmlFor="fieldRequired">Required</Label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="fieldExtraction">Extraction question (optional)</Label>
              <Input id="fieldExtraction" value={draft.extractionQuestion ?? ''} onChange={(e) => updateDraft({ extractionQuestion: e.target.value })} />
            </div>

            {draft.dataType === FieldDataType.ENUM && (
              <div className="space-y-2 pl-3 border-l">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>Add option</Button>
                </div>
                {(draft.options ?? []).map((option, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="value" value={option.value} onChange={(e) => updateOption(i, { value: e.target.value })} />
                    <Input placeholder="Arabic label" value={option.labelAr} onChange={(e) => updateOption(i, { labelAr: e.target.value })} />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeOption(i)}>×</Button>
                  </div>
                ))}
              </div>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDialog} disabled={upsertField.isPending}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsertField.isPending}>
              {upsertField.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FieldsManagementPage() {
  return (
    <PermissionGate require="template.manage">
      <FieldsManagementContent />
    </PermissionGate>
  );
}