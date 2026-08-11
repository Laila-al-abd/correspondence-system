'use client';
// src/app/dashboard/users/[id]/attributes/page.tsx
//
// Real ABAC vocabulary wired up via GET /access/attributes
// (useAccessAttributes). If that call fails -- most likely a 403, since
// AccessController is currently gated by 'template.manage' only, and this
// page only requires 'user.manage' -- the form degrades to a manual
// attributeCode + value-type entry instead of crashing. See the chat
// recommendation: adding @RequireAnyPermission('template.manage',
// 'user.manage') to AccessController.attributes() (mirroring the pattern
// already used for UsersController's assignRole/revokeRole overrides) would
// let this page always get the nice picker.
//
// Note: AttributeDefinitionView has no `options` field for ENUM attributes
// (unlike TemplateField, which does). So an ENUM-typed attribute still falls
// back to a free-text value input here -- there's no known list of valid
// values to build a <select> from. Backend-side, assertValueMatchesType only
// checks `typeof value === 'string'` for ENUM, so this is safe, just not as
// nice as a dropdown would be.

import { useState, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser, useSetUserAttribute, useClearUserAttribute } from '@/lib/hooks/use-users';
import { useAccessAttributes } from '@/lib/hooks/use-access';
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

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

// String values assumed to equal the enum member names, following the same
// convention as every other enum seen in this codebase (RequestStatus,
// FieldDataType, etc. are all EnumMember = "EnumMember"). Not independently
// confirmed for AttributeDataType specifically.
type DataTypeCode = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ENUM';

function ManageAttributesContent() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const { data: user, isLoading, isError } = useUser(userId);
  const {
    data: definitionsData,
    isLoading: definitionsLoading,
    isError: definitionsError,
  } = useAccessAttributes();
  const definitions = definitionsData ?? [];
  // True once we know for certain we can't get the real vocabulary --
  // triggers the manual-entry fallback.
  const useFallback = !definitionsLoading && (definitionsError || definitions.length === 0);

  const definitionByCode = useMemo(
    () => new Map(definitions.map((d) => [d.code, d])),
    [definitions],
  );

  const setAttribute = useSetUserAttribute(userId);
  const clearAttribute = useClearUserAttribute(userId);

  const [attributeCode, setAttributeCode] = useState('');
  // Only used in fallback mode, where there's no real definition to read a
  // dataType from.
  const [fallbackValueType, setFallbackValueType] = useState<DataTypeCode>('TEXT');
  const [rawValue, setRawValue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (isError || !user) return <p className="p-6 text-destructive">User not found.</p>;

  const selectedDefinition = definitionByCode.get(attributeCode);
  const effectiveDataType: DataTypeCode = useFallback
    ? fallbackValueType
    : (selectedDefinition?.dataType as DataTypeCode | undefined) ?? 'TEXT';

  function coerceValue(): string | number | boolean | null {
    if (effectiveDataType === 'NUMBER') {
      const n = Number(rawValue);
      if (!Number.isFinite(n)) return null;
      return n;
    }
    if (effectiveDataType === 'BOOLEAN') {
      return rawValue === 'true';
    }
    // TEXT, DATE, and ENUM (no known option list -- see file header) all
    // send a plain string.
    return rawValue;
  }

  async function handleSet(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!attributeCode.trim()) {
      setFormError('Attribute is required.');
      return;
    }

    const value = coerceValue();
    if (value === null) {
      setFormError('Value must be a valid number.');
      return;
    }

    try {
      await setAttribute.mutateAsync({ attributeCode: attributeCode.trim(), value });
      setAttributeCode('');
      setRawValue('');
    } catch {
      setFormError('Failed to set attribute. Please check the value and try again.');
    }
  }

  async function handleClear(code: string) {
    setClearError(null);
    try {
      await clearAttribute.mutateAsync(code);
    } catch {
      setClearError('Failed to clear attribute. Please try again.');
    }
  }

  function labelFor(code: string): string {
    const def = definitionByCode.get(code);
    if (!def) return code;
    return `${def.label.ar}${def.label.en ? ` (${def.label.en})` : ''}`;
  }

  return (
    <div className="p-6 space-y-4">
      <Link href="/dashboard/users" className="text-sm font-medium hover:underline" style={{ color: 'var(--ics-accent)' }}>
        ← Back to users
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle style={{ color: 'var(--ics-primary)' }}>
            Attributes for {user.fullNameAr}{user.fullNameEn && ` (${user.fullNameEn})`}
          </CardTitle>
          {useFallback && (
            <p className="text-xs text-muted-foreground">
              Couldn&apos;t load the attribute catalog (likely a permissions
              gap on GET /access/attributes -- see the note at the top of
              this file). Falling back to manual entry.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {user.attributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attributes set.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.attributes.map((a) => (
                  <TableRow key={a.attributeId}>
                    <TableCell>
                      {labelFor(a.attributeCode)}
                      {!definitionByCode.has(a.attributeCode) && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          ({a.attributeCode})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{String(a.value)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleClear(a.attributeCode)}
                        disabled={clearAttribute.isPending}
                      >
                        Clear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {clearError && <p className="text-sm text-destructive">{clearError}</p>}

          <Separator />

          <form onSubmit={handleSet} className="space-y-3">
            <p className="text-sm font-medium">Set an attribute</p>

            {useFallback ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="attributeCode">Attribute code <span className="text-destructive">*</span></Label>
                  <Input id="attributeCode" value={attributeCode} onChange={(e) => setAttributeCode(e.target.value)} disabled={setAttribute.isPending} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="valueType">Value type</Label>
                  <select
                    id="valueType"
                    className={selectClass}
                    value={fallbackValueType}
                    onChange={(e) => { setFallbackValueType(e.target.value as DataTypeCode); setRawValue(''); }}
                    disabled={setAttribute.isPending}
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="BOOLEAN">Boolean</option>
                    <option value="DATE">Date</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="attributeCode">Attribute <span className="text-destructive">*</span></Label>
                <select
                  id="attributeCode"
                  className={selectClass}
                  value={attributeCode}
                  onChange={(e) => { setAttributeCode(e.target.value); setRawValue(''); }}
                  disabled={setAttribute.isPending}
                  required
                >
                  <option value="">— select attribute —</option>
                  {definitions.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.label.ar}{d.label.en ? ` (${d.label.en})` : ''} — {d.code}
                    </option>
                  ))}
                </select>
                {selectedDefinition?.description && (
                  <p className="text-xs text-muted-foreground">
                    {selectedDefinition.description.ar}
                    {selectedDefinition.description.en && ` (${selectedDefinition.description.en})`}
                  </p>
                )}

              </div>
            )}

            <div className="space-y-1">
                <Label htmlFor="value">Value</Label>
                {effectiveDataType === 'BOOLEAN' ? (
                    <select id="value" className={selectClass} value={rawValue} onChange={(e) => setRawValue(e.target.value)} disabled={setAttribute.isPending}>
                    <option value="">— select —</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                    </select>
                ) : effectiveDataType === 'ENUM' && selectedDefinition && selectedDefinition.options.length > 0 ? (
                    // Fixed: previously ENUM always fell through to free text, since
                    // AttributeDefinitionView had no options field to build a dropdown
                    // from. Now that the backend returns real options (see AttributeDefinition
                    // domain fix + attribute_options table), render the same way
                    // ClassifyByHumanForm renders an ENUM template field.
                    <select
                    id="value"
                    className={selectClass}
                    value={rawValue}
                    onChange={(e) => setRawValue(e.target.value)}
                    disabled={setAttribute.isPending}
                    >
                    <option value="">— select —</option>
                    {[...selectedDefinition.options]
                        .sort((a, b) => a.ordinal - b.ordinal)
                        .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label.ar}
                            {opt.label.en ? ` (${opt.label.en})` : ''}
                        </option>
                        ))}
                    </select>
                ) : (
                    <Input
                    id="value"
                    type={effectiveDataType === 'NUMBER' ? 'number' : effectiveDataType === 'DATE' ? 'date' : 'text'}
                    value={rawValue}
                    onChange={(e) => setRawValue(e.target.value)}
                    disabled={setAttribute.isPending}
                    />
                )}
                </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" disabled={setAttribute.isPending}>
              {setAttribute.isPending ? 'Setting…' : 'Set Attribute'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManageUserAttributesPage() {
  return (
    <PermissionGate require="user.manage">
      <ManageAttributesContent />
    </PermissionGate>
  );
}