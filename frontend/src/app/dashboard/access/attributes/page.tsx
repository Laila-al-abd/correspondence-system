'use client';
// src/app/dashboard/access/attributes/page.tsx
//
// The ABAC vocabulary: every attribute an eligibility rule may refer to, plus
// the form that adds one.
//
// Permission: 'template.manage'. POST /access/attributes overrides the
// AccessController's class-level pair for exactly this reason -- authoring the
// vocabulary is part of authoring templates, not part of administering user
// accounts. Note that the LIST on this page comes from GET /access/attributes,
// which still carries the class-level pair, so a caller holding only
// 'template.manage' sees the form but an empty table; the note under the table
// says so rather than looking broken.
//
// Why a code cannot be edited afterwards: the code is the name every stored
// eligibility rule and every imported user attribute refers to. Renaming it
// would silently detach existing rules from the attribute they were written
// against, so codes are write-once here by design, not by omission.

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import {
  useAccessAttributes,
  useCreateAttributeDefinition,
} from '@/lib/hooks/use-access';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { AttributeDataType } from '@/types/access';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

const DATA_TYPES: { value: AttributeDataType; label: string; hint: string }[] = [
  { value: AttributeDataType.TEXT, label: 'TEXT', hint: 'Any text. Compared exactly.' },
  { value: AttributeDataType.NUMBER, label: 'NUMBER', hint: 'A number. Enables the GTE / LTE operators in rules.' },
  { value: AttributeDataType.BOOLEAN, label: 'BOOLEAN', hint: 'True or false.' },
  { value: AttributeDataType.DATE, label: 'DATE', hint: 'A calendar date.' },
  { value: AttributeDataType.ENUM, label: 'ENUM', hint: 'A fixed list of choices you define below.' },
];

interface OptionRow {
  value: string;
  labelAr: string;
  labelEn: string;
}

const emptyOption: OptionRow = { value: '', labelAr: '', labelEn: '' };

function extractMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return 'Could not create the attribute. Please try again.';
}

function AttributeVocabularyContent() {
  const { data, isLoading, isError } = useAccessAttributes();
  const definitions = data ?? [];
  const create = useCreateAttributeDefinition();

  const [code, setCode] = useState('');
  const [labelAr, setLabelAr] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [dataType, setDataType] = useState<AttributeDataType>(AttributeDataType.TEXT);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [options, setOptions] = useState<OptionRow[]>([{ ...emptyOption }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const isEnum = dataType === AttributeDataType.ENUM;
  const selectedHint = DATA_TYPES.find((entry) => entry.value === dataType)?.hint ?? '';

  function updateOption(index: number, patch: Partial<OptionRow>) {
    setOptions((current) =>
      current.map((row, position) => (position === index ? { ...row, ...patch } : row)),
    );
  }

  function resetForm() {
    setCode('');
    setLabelAr('');
    setLabelEn('');
    setDataType(AttributeDataType.TEXT);
    setDescriptionAr('');
    setOptions([{ ...emptyOption }]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setCreated(null);

    const normalizedCode = code.trim().toLowerCase();
    // Mirrors the backend's @Matches so a typo is caught before a round trip.
    if (!/^[a-z][a-z0-9_]{1,49}$/.test(normalizedCode)) {
      setFormError(
        'The code must be 2-50 characters of lowercase letters, digits and underscores, starting with a letter (for example: first_semester_mark).',
      );
      return;
    }
    if (!labelAr.trim()) {
      setFormError('An Arabic label is required.');
      return;
    }

    // The aggregate enforces this too, but saying it here costs nothing and
    // explains itself better than a 400 does.
    const filledOptions = options.filter(
      (row) => row.value.trim() !== '' || row.labelAr.trim() !== '',
    );
    if (isEnum && filledOptions.length === 0) {
      setFormError('An ENUM attribute must define at least one choice.');
      return;
    }
    if (isEnum && filledOptions.some((row) => !row.value.trim() || !row.labelAr.trim())) {
      setFormError('Every choice needs both a stored value and an Arabic label.');
      return;
    }
    const values = filledOptions.map((row) => row.value.trim());
    if (new Set(values).size !== values.length) {
      setFormError('Two choices cannot share the same stored value.');
      return;
    }

    try {
      const result = await create.mutateAsync({
        code: normalizedCode,
        labelAr: labelAr.trim(),
        labelEn: labelEn.trim() || undefined,
        dataType,
        descriptionAr: descriptionAr.trim() || undefined,
        options: isEnum
          ? filledOptions.map((row, index) => ({
              value: row.value.trim(),
              labelAr: row.labelAr.trim(),
              labelEn: row.labelEn.trim() || undefined,
              ordinal: index,
            }))
          : undefined,
      });
      setCreated(result.code);
      resetForm();
    } catch (error) {
      setFormError(extractMessage(error));
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Attribute vocabulary</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These are the attributes a request type&apos;s eligibility rules can be written
          against, and the attributes a user can carry a value for. Adding one here makes
          it available in both places immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add an attribute</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="attribute-code">Code</Label>
                <Input
                  id="attribute-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="first_semester_mark"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  lower_snake_case. This is the name rules refer to, and it cannot be
                  changed later.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="attribute-data-type">Data type</Label>
                <select
                  id="attribute-data-type"
                  className={selectClass}
                  value={dataType}
                  onChange={(event) =>
                    setDataType(event.target.value as AttributeDataType)
                  }
                >
                  {DATA_TYPES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{selectedHint}</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="attribute-label-ar">Label (Arabic)</Label>
                <Input
                  id="attribute-label-ar"
                  value={labelAr}
                  onChange={(event) => setLabelAr(event.target.value)}
                  dir="rtl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="attribute-label-en">Label (English, optional)</Label>
                <Input
                  id="attribute-label-en"
                  value={labelEn}
                  onChange={(event) => setLabelEn(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="attribute-description">Description (optional)</Label>
              <Input
                id="attribute-description"
                value={descriptionAr}
                onChange={(event) => setDescriptionAr(event.target.value)}
                placeholder="What this attribute means, for whoever authors rules later"
                dir="rtl"
              />
            </div>

            {isEnum && (
              <div className="space-y-3 rounded-md border p-4">
                <div>
                  <p className="text-sm font-medium">Choices</p>
                  <p className="text-xs text-muted-foreground">
                    The stored value is what a rule compares against; the label is what
                    an administrator sees when setting the attribute on a user.
                  </p>
                </div>

                {options.map((row, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-3">
                    <Input
                      value={row.value}
                      onChange={(event) => updateOption(index, { value: event.target.value })}
                      placeholder="stored value"
                      aria-label={`Choice ${index + 1} stored value`}
                    />
                    <Input
                      value={row.labelAr}
                      onChange={(event) => updateOption(index, { labelAr: event.target.value })}
                      placeholder="التسمية العربية"
                      dir="rtl"
                      aria-label={`Choice ${index + 1} Arabic label`}
                    />
                    <div className="flex gap-2">
                      <Input
                        value={row.labelEn}
                        onChange={(event) => updateOption(index, { labelEn: event.target.value })}
                        placeholder="English label"
                        aria-label={`Choice ${index + 1} English label`}
                      />
                      {options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setOptions((current) =>
                              current.filter((_, position) => position !== index),
                            )
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOptions((current) => [...current, { ...emptyOption }])}
                >
                  Add choice
                </Button>
              </div>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            {created && (
              <p className="text-sm text-green-700">
                Created “{created}”. It is now available in the eligibility-rule builder
                and on every user&apos;s attributes screen.
              </p>
            )}

            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create attribute'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Existing attributes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {isError && (
            <p className="text-sm text-muted-foreground">
              The list could not be loaded. Reading the vocabulary requires both
              &apos;template.manage&apos; and &apos;user.manage&apos;; creating an
              attribute above needs only &apos;template.manage&apos;, so the form still
              works.
            </p>
          )}
          {!isLoading && !isError && definitions.length === 0 && (
            <p className="text-muted-foreground">No attributes defined yet.</p>
          )}
          {!isLoading && !isError && definitions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Data type</TableHead>
                  <TableHead>Choices</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {definitions.map((definition) => (
                  <TableRow key={definition.id}>
                    <TableCell className="font-mono text-xs">{definition.code}</TableCell>
                    <TableCell>
                      <span dir="rtl">{definition.label.ar}</span>
                      {definition.label.en && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {definition.label.en}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{definition.dataType}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {definition.options.length === 0
                        ? '—'
                        : [...definition.options]
                            .sort((a, b) => a.ordinal - b.ordinal)
                            .map((option) => option.value)
                            .join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            To require an attribute for a request type, open that request type and add an
            eligibility rule. To give a user a value for one, open the user and use{' '}
            <Link href="/dashboard/users" className="underline">
              Users
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AttributeVocabularyPage() {
  return (
    <PermissionGate require="template.manage">
      <AttributeVocabularyContent />
    </PermissionGate>
  );
}
