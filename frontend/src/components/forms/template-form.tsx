'use client';
// src/components/forms/template-form.tsx
//
// NOTE: Category ID and Sensitivity Level ID are optional end-to-end and
// removed from user input entirely.
//
// NOTE: `code` can only be set at creation in this form — even though
// UpdateTemplateDto technically still accepts `code` while a template has
// none yet, this form doesn't expose that path in edit mode. Pre-existing
// limitation, not touched here.
//
// NOTE: dirty-tracking is a simple "any field changed at least once" flag,
// not deep-equality against the original values — typing into a field and
// then reverting it to the original value still counts as dirty. Deliberate
// simplification, not a bug.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTemplate, useUpdateTemplate } from '@/lib/hooks/use-template';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateFieldDto,
  TemplateFieldOptionDto,
  TemplateCatalogView,
  FieldDataType,
  Priority,
} from '@/types/catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

function emptyField(): TemplateFieldDto {
  return { key: '', labelAr: '', labelEn: '', dataType: FieldDataType.TEXT, isRequired: false, extractionQuestion: '', options: [] };
}
function emptyOption(): TemplateFieldOptionDto {
  return { value: '', labelAr: '', labelEn: '' };
}

interface Props {
  /** Pass an existing template to edit its own attributes. Omit to create a new one. */
  existing?: TemplateCatalogView;
}

export function TemplateForm({ existing }: Props) {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate(existing?.id ?? '');

  const [code, setCode] = useState(existing?.code ?? '');
  const [titleAr, setTitleAr] = useState(existing?.nameAr ?? '');
  const [titleEn, setTitleEn] = useState(existing?.nameEn ?? '');
  const [descriptionAr, setDescriptionAr] = useState(existing?.descriptionAr ?? '');
  const [descriptionEn, setDescriptionEn] = useState(existing?.descriptionEn ?? '');
  const [defaultPriority, setDefaultPriority] = useState<Priority | ''>(existing?.defaultPriority ?? '');
  const [classifierDocument, setClassifierDocument] = useState(existing?.classifierDocument ?? '');
  const codeEditable = !existing?.code;

  // Only meaningful in create mode.
  const [fields, setFields] = useState<TemplateFieldDto[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Edit-mode-only: tracks whether any top-level attribute has been touched,
  // so the Update button stays disabled until there's something to save.
  const [isDirty, setIsDirty] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  function addField() { setFields((prev) => [...prev, emptyField()]); }
  function removeField(i: number) { setFields((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateField(i: number, patch: Partial<TemplateFieldDto>) {
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }
  function addOption(fi: number) {
    setFields((prev) => prev.map((f, i) => (i === fi ? { ...f, options: [...(f.options ?? []), emptyOption()] } : f)));
  }
  function removeOption(fi: number, oi: number) {
    setFields((prev) => prev.map((f, i) => (i === fi ? { ...f, options: (f.options ?? []).filter((_, idx) => idx !== oi) } : f)));
  }
  function updateOption(fi: number, oi: number, patch: Partial<TemplateFieldOptionDto>) {
    setFields((prev) => prev.map((f, i) => (i === fi ? { ...f, options: (f.options ?? []).map((o, idx) => (idx === oi ? { ...o, ...patch } : o)) } : f)));
  }

  async function handleSubmit() {
    setSubmitError(null);

    if (!titleAr.trim()) {
      setSubmitError('Arabic title is required.');
      return;
    }
    for (const f of fields) {
      if (!f.key.trim() || !f.labelAr.trim()) {
        setSubmitError('Every field needs a key and an Arabic label.');
        return;
      }
      if (f.dataType === FieldDataType.ENUM && (!f.options || f.options.length === 0)) {
        setSubmitError(`Field "${f.key}" is an ENUM but has no options.`);
        return;
      }
    }

    try {
      if (existing) {
        // 👉 UPDATE THIS REQUEST OBJECT:
        const request: UpdateTemplateDto = {
          code: codeEditable && code.trim() ? code.trim() : undefined,
          titleAr: titleAr || undefined,
          titleEn: titleEn || undefined,
          descriptionAr: descriptionAr || undefined,
          descriptionEn: descriptionEn || undefined,
          defaultPriority: defaultPriority || undefined,
          classifierDocument: classifierDocument || undefined,
        };
        await updateTemplate.mutateAsync(request);
      } else {
        const request: CreateTemplateDto = {
          code: code.trim() || undefined,
          titleAr,
          titleEn: titleEn || undefined,
          descriptionAr: descriptionAr || undefined,
          descriptionEn: descriptionEn || undefined,
          defaultPriority: defaultPriority || undefined,
          classifierDocument: classifierDocument || undefined,
          fields: fields.length > 0 ? fields : undefined,
        };
        await createTemplate.mutateAsync(request);
      }
      setSuccessOpen(true);
    } catch {
      setSubmitError('Failed to save the template. Please check the values and try again.');
    }
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending;
  const updateDisabled = isPending || (!!existing && !isDirty);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{existing ? `Edit ${existing.nameAr}` : 'New Template'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="code">
            Code {codeEditable ? '(optional, write-once)' : ''}
          </Label>
          <Input
            id="code"
            placeholder="ENROLL_CERT"
            value={codeEditable ? code : existing?.code ?? ''}
            onChange={(e) => {
              if (codeEditable) {
                setCode(e.target.value);
                setIsDirty(true);
              }
            }}
            disabled={!codeEditable}
          />
          {!codeEditable && (
            <p className="text-xs text-muted-foreground">
              Code is set and cannot be changed once assigned.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="titleAr">Title (Arabic)</Label>
          <Input id="titleAr" value={titleAr} onChange={(e) => { setTitleAr(e.target.value); setIsDirty(true); }} />
        </div>
        {/* ... rest of your inputs */}

        <div className="space-y-1">
          <Label htmlFor="titleAr">Title (Arabic)</Label>
          <Input id="titleAr" value={titleAr} onChange={(e) => { setTitleAr(e.target.value); setIsDirty(true); }} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="titleEn">Title (English)</Label>
          <Input id="titleEn" value={titleEn} onChange={(e) => { setTitleEn(e.target.value); setIsDirty(true); }} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="descriptionAr">Description (Arabic)</Label>
          <Input id="descriptionAr" value={descriptionAr} onChange={(e) => { setDescriptionAr(e.target.value); setIsDirty(true); }} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Input id="descriptionEn" value={descriptionEn} onChange={(e) => { setDescriptionEn(e.target.value); setIsDirty(true); }} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="defaultPriority">Default priority</Label>
          <select
            id="defaultPriority"
            className={selectClass}
            value={defaultPriority}
            onChange={(e) => { setDefaultPriority(e.target.value as Priority | ''); setIsDirty(true); }}
          >
            <option value="">— none —</option>
            {Object.values(Priority).map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="classifierDocument">Classifier document</Label>
          <Input
            id="classifierDocument"
            placeholder="Exact Arabic text the classifier embeds"
            value={classifierDocument}
            onChange={(e) => { setClassifierDocument(e.target.value); setIsDirty(true); }}
          />
        </div>

        {existing ? (
          <p className="text-sm text-muted-foreground">
            Fields are managed separately — use "Manage Fields" below to add, redefine, reorder,
            or remove them.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <Button type="button" variant="outline" onClick={addField}>Add field</Button>
            </div>

            {fields.map((field, fi) => (
              <div key={fi} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Input placeholder="field_key" value={field.key} onChange={(e) => updateField(fi, { key: e.target.value })} />
                  <Button type="button" variant="outline" onClick={() => removeField(fi)}>Remove</Button>
                </div>
                <Input placeholder="Arabic label" value={field.labelAr} onChange={(e) => updateField(fi, { labelAr: e.target.value })} />
                <Input placeholder="English label (optional)" value={field.labelEn ?? ''} onChange={(e) => updateField(fi, { labelEn: e.target.value })} />
                <select className={selectClass} value={field.dataType} onChange={(e) => {
                  // Options only mean something for ENUM. Leaving them behind
                  // sent stale choices along with a TEXT field.
                  const nextType = e.target.value as FieldDataType;
                  updateField(fi, nextType === FieldDataType.ENUM ? { dataType: nextType } : { dataType: nextType, options: [] });
                }}>
                  {Object.values(FieldDataType).map((dt) => (<option key={dt} value={dt}>{dt}</option>))}
                </select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={field.isRequired ?? false} onChange={(e) => updateField(fi, { isRequired: e.target.checked })} />
                  <Label>Required</Label>
                </div>
                <Input placeholder="Extraction question (Arabic, optional)" value={field.extractionQuestion ?? ''} onChange={(e) => updateField(fi, { extractionQuestion: e.target.value })} />

                {field.dataType === FieldDataType.ENUM && (
                  <div className="space-y-2 pl-3 border-l">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      <Button type="button" variant="outline" onClick={() => addOption(fi)}>Add option</Button>
                    </div>
                    {(field.options ?? []).map((option, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input placeholder="value" value={option.value} onChange={(e) => updateOption(fi, oi, { value: e.target.value })} />
                        <Input placeholder="Arabic label" value={option.labelAr} onChange={(e) => updateOption(fi, oi, { labelAr: e.target.value })} />
                        <Button type="button" variant="outline" onClick={() => removeOption(fi, oi)}>×</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/templates')} disabled={isPending}>
            Cancel
          </Button>
          {existing && (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => router.push(`/dashboard/templates/${existing.id}/fields`)}
            >
              Manage Fields
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={updateDisabled}>
            {isPending ? 'Saving…' : existing ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </CardContent>

      {/* Dismissible only via the button below — a successful save shouldn't
          leave a now-stale form visible behind an accidentally-closed dialog. */}
      <Dialog open={successOpen} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{existing ? 'Template updated successfully' : 'Template created successfully'}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/dashboard/templates')}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}