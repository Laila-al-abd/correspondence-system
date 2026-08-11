// src/components/permission-gate.tsx
'use client';
import { ReactNode } from 'react';
import { usePermissions } from '@/lib/auth/permissions-provider';

export function PermissionGate({
  require,
  children,
}: {
  require: string | string[];
  children: ReactNode;
}) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!hasPermission(require)) {
    return <p className="text-muted-foreground">You don't have access to this page.</p>;
  }

  return <>{children}</>;
}