'use client';
// src/components/forms/role-form.tsx
//
// Form for creating or updating a role.
// POST /roles (create) | PATCH /roles/:roleId (update)
//
// Notes:
// - name is required (LocalizedTextDto: ar 1-255, en optional 1-255).
// - description is optional (same structure, null clears it on update).
// - permissionCodes is optional string[] only on create (not on update).
// - PATCH /roles/:roleId exists → supports edit mode via existing prop.
// - Requires 'role.manage' permission.
// - No FK fields on the role itself; permissionCodes references permission codes
//   from GET /roles/permissions (Case a: real listing endpoint).
//   We render as multi-select for create mode, hidden on update (separate permissions screen).

import type { ReactNode } from 'react';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateRole, useUpdateRole, usePermissionGroups } from '@/lib/hooks/use-roles';
import { CreateRoleDto, UpdateRoleDto, RoleDetailView, PermissionGroupView } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /** Optional existing role to edit — enables update mode when provided. */
  existing?: RoleDetailView;
}

export function RoleForm({ existing }: Props) {
  const router = useRouter();
  const createRole = useCreateRole();
  const updateRole = existing ? useUpdateRole(existing.id) : null;
  const { data: permissionGroupsData } = usePermissionGroups();

  const permissionGroups = permissionGroupsData ?? [];

  // Form state
  const [nameAr, setNameAr] = useState<string>(existing?.name.ar ?? '');
  const [nameEn, setNameEn] = useState<string>(existing?.name.en ?? '');
  const [descriptionAr, setDescriptionAr] = useState<string>(existing?.description?.ar ?? '');
  const [descriptionEn, setDescriptionEn] = useState<string>(existing?.description?.en ?? '');
  const [permissionCodes, setPermissionCodes] = useState<string[]>(
    existing ? [] : [] // permissionCodes only on create; update uses separate permissions screen
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isUpdate = !!existing;
  const isPending = isUpdate ? updateRole?.isPending ?? false : createRole.isPending;
  const roleId = existing?.id;

  // Flatten all permission codes from groups for the multi-select (create mode)
  const allPermissionCodes = permissionGroups.flatMap((g) => g.permissions.map((p) => p.code));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

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

    const name: { ar: string; en?: string } = { ar: nameAr.trim(), en: nameEn.trim() || undefined };
    const description =
      descriptionAr.trim() || descriptionEn.trim()
        ? { ar: descriptionAr.trim(), en: descriptionEn.trim() || undefined }
        : undefined;

    try {
      if (isUpdate && roleId && updateRole) {
        const request: UpdateRoleDto = { name, description };
        await updateRole.mutateAsync(request);
      } else {
        const request: CreateRoleDto = { name, description, permissionCodes: permissionCodes.length > 0 ? permissionCodes : undefined };
        await createRole.mutateAsync(request);
      }
      router.push('/dashboard/roles');
    } catch {
      setSubmitError(isUpdate ? 'Failed to update role. Please try again.' : 'Failed to create role. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isUpdate ? 'Edit Role' : 'Create Role'}</CardTitle>
        <CardDescription>
          {isUpdate
            ? 'Update the role name and description. Permissions are managed on the separate Permissions tab.'
            : 'Define a new role. Optionally assign initial permissions (can be added later).'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (required) */}
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
            <Label htmlFor="nameEn">Name (English)</Label>
            <Input
              id="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>

          <Separator />

          {/* Description (optional) */}
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

          {/* Initial permissions (create only) */}
          {!isUpdate && permissionGroups.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <Label htmlFor="permissionCodes">Initial permissions (optional)</Label>
                <select
                  id="permissionCodes"
                  className={selectClass}
                  multiple
                  value={permissionCodes}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setPermissionCodes(selected);
                  }}
                  disabled={isPending}
                >
                  {permissionGroups.map((group) => (
                    <optgroup key={group.id} label={`${group.name.ar}${group.name.en ? ` (${group.name.en})` : ''}`}>
                      {group.permissions.map((perm) => (
                        <option key={perm.code} value={perm.code}>
                          {perm.name.ar}{perm.name.en ? ` (${perm.name.en})` : ''} — {perm.code}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Hold Ctrl/Cmd to select multiple. Permissions can also be added later.
                </p>
              </div>
            </>
          )}

          {isUpdate && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Permissions for this role are managed on the Permissions tab.
              </p>
            </>
          )}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (isUpdate ? 'Updating…' : 'Creating…') : isUpdate ? 'Update Role' : 'Create Role'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/roles')} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}