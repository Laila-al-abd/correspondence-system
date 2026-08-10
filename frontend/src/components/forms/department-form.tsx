'use client';
// src/components/forms/department-form.tsx
//
// Form for manually creating a department.
// POST /organization/departments
//
// Notes:
// - unitTypeCode is a STRING CODE (e.g. "DEPARTMENT"), not a UUID.
//   Backend resolves it via OrgUnitTypeRepository.findByCode().
//   Listing endpoint now exists: GET /organization/departments/unit-types (Case a).
// - parentId is a UUID referencing another Department.
//   Real listing endpoints exist (GET /organization/departments/tree) → dropdown (Case a).
// - name and description are bilingual (Arabic required, English optional).
// - No update route exists (no PATCH /organization/departments/:id) → create-only form.

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDepartment, useDepartmentTree, useOrgUnitTypes } from '@/lib/hooks/use-organization';
import { CreateDepartmentDto } from '@/types/organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /** Optional existing department to edit — not used (no update route). */
  existing?: never;
}

export function DepartmentForm({ existing }: Props) {
  const router = useRouter();
  const createDepartment = useCreateDepartment();

  // Fetch org unit types for unit type dropdown (Case a: real listing endpoint exists)
  const { data: unitTypes, isLoading: unitTypesLoading } = useOrgUnitTypes();

  // Fetch full hierarchy for parent dropdown (Case a: real listing endpoint exists)
  const { data: treeData } = useDepartmentTree(true); // activeOnly=true

  // Flatten tree for simple select (could also use nested optgroups)
  const [flatDepartments, setFlatDepartments] = useState<
    { id: string; name: { ar: string; en?: string }; parentId: string | null }[]
  >([]);

  useEffect(() => {
    function flatten(
      nodes: { id: string; name: { ar: string; en?: string }; parentId: string | null; children: any[] }[],
      parentPath = ''
    ): { id: string; name: { ar: string; en?: string }; parentId: string | null; prefix: string }[] {
      return nodes.flatMap((node) => [
        // FIXED: The current node just uses the parentPath as its prefix!
        { id: node.id, name: node.name, parentId: node.parentId, prefix: parentPath }, 
        
        // The children get the parentPath + this node's name added to it
        ...flatten(node.children ?? [], `${parentPath}${node.name.ar} / `),
      ]);
    }
    if (treeData) {
      setFlatDepartments(flatten(treeData));
    }
  }, [treeData]);

  const [unitTypeCode, setUnitTypeCode] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = createDepartment.isPending;

  function getDepartmentLabel(dept: { id: string; name: { ar: string; en?: string }; parentId: string | null ; prefix?: string}): string {
    const en = dept.name.en ?? '';
    const prefix = dept.prefix ?? '';
    return `${prefix}${dept.name.ar}${en ? ` (${en})` : ''}`;
    
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!unitTypeCode) {
      setSubmitError('Unit type is required.');
      return;
    }
    if (!nameAr.trim()) {
      setSubmitError('Arabic name is required.');
      return;
    }
    if (nameAr.length > 255) {
      setSubmitError('Arabic name must be 255 characters or fewer.');
      return;
    }
    if (nameEn && nameEn.length > 255) {
      setSubmitError('English name must be 255 characters or fewer.');
      return;
    }
    if (descriptionAr && descriptionAr.length > 255) {
      setSubmitError('Arabic description must be 255 characters or fewer.');
      return;
    }
    if (descriptionEn && descriptionEn.length > 255) {
      setSubmitError('English description must be 255 characters or fewer.');
      return;
    }
    if (descriptionEn.trim() && !descriptionAr.trim()) {
      setSubmitError('If you provide an English description, you must also provide an Arabic description.');
      return;
    }

    const request: CreateDepartmentDto = {
      unitTypeCode,
      name: { ar: nameAr.trim(), en: nameEn.trim() || undefined },
      description:
        descriptionAr.trim() || descriptionEn.trim()
          ? {
              ar: descriptionAr.trim(),
              en: descriptionEn.trim() || undefined,
            }
          : undefined,
      parentId: parentId || undefined,
    };

    try {
      await createDepartment.mutateAsync(request);
      router.push('/dashboard/organization/departments');
    } catch {
      setSubmitError('Failed to create department. Please check the values and try again.');
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Create Department</CardTitle>
        <CardDescription>
          Manually add a new organizational unit. For bulk imports from the personnel
          directory, use the "Sync Departments" action instead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit type — Case (a): listing endpoint available via GET /organization/departments/unit-types */}
          <div className="space-y-1">
            <Label htmlFor="unitTypeCode">Unit type <span className="text-destructive">*</span></Label>
            <select
              id="unitTypeCode"
              className={selectClass}
              value={unitTypeCode}
              onChange={(e) => setUnitTypeCode(e.target.value)}
              disabled={isPending || unitTypesLoading}
              required
            >
              <option value="">— select type —</option>
              {unitTypes?.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.name.ar}{u.name.en && ` (${u.name.en})`} [{u.code}]
                </option>
              ))}
            </select>
            {unitTypesLoading && (
              <p className="text-xs text-muted-foreground">Loading unit types…</p>
            )}
            {!unitTypesLoading && unitTypes?.length === 0 && (
              <p className="text-xs text-destructive">No unit types configured</p>
            )}
          </div>

          {/* Bilingual name */}
          <div className="space-y-1">
            <Label htmlFor="nameAr">Name (Arabic) <span className="text-destructive">*</span></Label>
            <Input
              id="nameAr"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              disabled={isPending}
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="nameEn">Name (English) </Label>
            <Input
              id="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>

          <Separator />

          {/* Bilingual description */}
          <div className="space-y-1">
            <Label htmlFor="descriptionAr">Description (Arabic)</Label>
            <Input
              id="descriptionAr"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            <Input
              id="descriptionEn"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>

          <Separator />

          {/* Parent department — Case (a): real listing endpoint exists */}
          <div className="space-y-1">
            <Label htmlFor="parentId">Parent department (optional)</Label>
            <select
              id="parentId"
              className={selectClass}
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={isPending}
            >
              <option value="">— no parent (root unit) —</option>
              {flatDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {getDepartmentLabel(dept)}
                </option>
              ))}
            </select>
            {flatDepartments.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No departments available yet. Sync from directory or create root units first.
              </p>
            )}
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Creating…' : 'Create Department'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/organization/departments')} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}