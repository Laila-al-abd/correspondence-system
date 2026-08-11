'use client';
// src/components/forms/create-user-form.tsx
//
// Form for POST /users. No update route matches this one (users are edited
// via the roles/attributes sub-pages, not a general PATCH), so this is
// create-only, same shape as DepartmentForm.
//
// Note: unlike RoleForm/DepartmentForm, CreateUserDto's name fields are FLAT
// top-level strings (fullNameAr/fullNameEn), not a nested { ar, en } object --
// confirmed directly against the DTO, don't copy the nested pattern here.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useCreateUser } from '@/lib/hooks/use-users';
import { useRoles } from '@/lib/hooks/use-roles';
import { useDepartmentTree } from '@/lib/hooks/use-organization';
import { CreateUserDto } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

// Exact string values from CreateUserDto's @IsIn([...]) decorator -- a
// deliberate subset of UserType, APPLICANT excluded by design.
const USER_TYPES = ['EMPLOYEE', 'STUDENT', 'ADMIN'] as const;

interface FlatDept {
  id: string;
  name: { ar: string; en?: string };
  parentId: string | null;
  prefix: string;
}

// Duplicated from department-form.tsx's tree-flattening logic, same reasoning
// as other duplicated field renderers in this codebase: small and localized
// enough that sharing it isn't worth the indirection yet.
function flattenTree(
  nodes: { id: string; name: { ar: string; en?: string }; parentId: string | null; children: any[] }[],
  parentPath = '',
): FlatDept[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, parentId: node.parentId, prefix: parentPath },
    ...flattenTree(node.children ?? [], `${parentPath}${node.name.ar} / `),
  ]);
}

export function CreateUserForm() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { data: roles } = useRoles();
  const { data: treeData } = useDepartmentTree(true);

  const flatDepartments = treeData ? flattenTree(treeData) : [];

  const [userType, setUserType] = useState<string>('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionalNumber, setInstitutionalNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [preferredLang, setPreferredLang] = useState('');
  const [roleId, setRoleId] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = createUser.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!userType) {
      setSubmitError('User type is required.');
      return;
    }
    if (!fullNameAr.trim()) {
      setSubmitError('Arabic name is required.');
      return;
    }
    if (!email.trim()) {
      setSubmitError('Email is required.');
      return;
    }
    if (!institutionalNumber.trim()) {
      setSubmitError('Institutional number is required.');
      return;
    }
    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters.');
      return;
    }

    const request: CreateUserDto = {
      userType,
      fullNameAr: fullNameAr.trim(),
      fullNameEn: fullNameEn.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      institutionalNumber: institutionalNumber.trim(),
      password,
      departmentId: departmentId || undefined,
      preferredLang: preferredLang || undefined,
      roleId: roleId || undefined,
    };

    try {
      await createUser.mutateAsync(request);
      router.push('/dashboard/users');
    } catch {
      setSubmitError('Failed to create user. Please check the values and try again.');
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>
          Provision a staff or student account. The password is temporary and
          should be handed to the person out of band.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="userType">User type <span className="text-destructive">*</span></Label>
            <select
              id="userType"
              className={selectClass}
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">— select type —</option>
              {USER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label htmlFor="fullNameAr">Full name (Arabic) <span className="text-destructive">*</span></Label>
            <Input id="fullNameAr" value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} disabled={isPending} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fullNameEn">Full name (English)</Label>
            <Input id="fullNameEn" value={fullNameEn} onChange={(e) => setFullNameEn(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" placeholder="user@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="institutionalNumber">Institutional number <span className="text-destructive">*</span></Label>
            <Input id="institutionalNumber" value={institutionalNumber} onChange={(e) => setInstitutionalNumber(e.target.value)} disabled={isPending} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Temporary password <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
                minLength={8}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label htmlFor="departmentId">Department (optional)</Label>
            <select
              id="departmentId"
              className={selectClass}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={isPending}
            >
              <option value="">— none —</option>
              {flatDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.prefix}{d.name.ar}{d.name.en ? ` (${d.name.en})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="preferredLang">Preferred language (optional)</Label>
            <select
              id="preferredLang"
              className={selectClass}
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              disabled={isPending}
            >
              <option value="">— default —</option>
              <option value="ar">Arabic</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="roleId">Initial role (optional)</Label>
            <select
              id="roleId"
              className={selectClass}
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={isPending}
            >
              <option value="">— none —</option>
              {(roles ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.ar}{r.name.en ? ` (${r.name.en})` : ''}
                </option>
              ))}
            </select>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Creating…' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/users')} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}