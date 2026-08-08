'use client';
// src/components/forms/template-form.tsx
//
// NOTE: Category ID and Sensitivity Level ID are now optional end-to-end
// and removed from user input entirely — they stay wired up in the backend
// for when business logic attaches to them.
//
// NOTE: TemplateCatalogView has no defaultPriority field, so it can't be
// prefilled on edit — starts blank even if one was set at creation.

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
  const [defaultPriority, setDefaultPriority] = useState<Priority | ''>('');
  const [classifierDocument, setClassifierDocument] = useState(existing?.classifierDocument ?? '');

  // Only meaningful in create mode — see note above.
  const [fields, setFields] = useState<TemplateFieldDto[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        const request: UpdateTemplateDto = {
          titleAr: titleAr || undefined,
          titleEn: titleEn || undefined,
          descriptionAr: descriptionAr || undefined,
          descriptionEn: descriptionEn || undefined,
          defaultPriority: defaultPriority || undefined,
          classifierDocument: classifierDocument || undefined,
        };
        await updateTemplate.mutateAsync(request);
        router.push(`/dashboard/templates/${existing.id}`);
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
        const created = await createTemplate.mutateAsync(request);
        router.push(`/dashboard/templates/${created.id}`);
      }
    } catch {
      setSubmitError('Failed to save the template. Please check the values and try again.');
    }
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{existing ? `Edit ${existing.nameAr}` : 'New Template'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!existing && (
          <div className="space-y-1">
            <Label htmlFor="code">Code (optional, write-once)</Label>
            <Input id="code" placeholder="ENROLL_CERT" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="titleAr">Title (Arabic)</Label>
          <Input id="titleAr" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="titleEn">Title (English)</Label>
          <Input id="titleEn" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="descriptionAr">Description (Arabic)</Label>
          <Input id="descriptionAr" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Input id="descriptionEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="defaultPriority">Default priority</Label>
          <select id="defaultPriority" className={selectClass} value={defaultPriority} onChange={(e) => setDefaultPriority(e.target.value as Priority | '')}>
            <option value="">— none —</option>
            {Object.values(Priority).map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="classifierDocument">Classifier document</Label>
          <Input id="classifierDocument" placeholder="Exact Arabic text the classifier embeds" value={classifierDocument} onChange={(e) => setClassifierDocument(e.target.value)} />
        </div>

        {existing ? (
          <p className="text-sm text-muted-foreground">
            Fields are managed separately — use the field editor on the template detail page to
            add, redefine, reorder, or remove them.
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
                <select className={selectClass} value={field.dataType} onChange={(e) => updateField(fi, { dataType: e.target.value as FieldDataType })}>
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

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving…' : existing ? 'Update Template' : 'Create Template'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/templates')}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}