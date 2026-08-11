// src/lib/auth/permissions-provider.tsx
'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useMyPermissions } from '@/lib/hooks/use-auth';

interface PermissionsContextValue {
  permissions: string[];
  isLoading: boolean;
  hasPermission: (code: string | string[]) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMyPermissions();
  const permissions = data ?? [];

  const value: PermissionsContextValue = {
    permissions,
    isLoading,
    // Checks if the user has a single permission OR every permission in an array
    hasPermission: (code) =>
      Array.isArray(code)
        ? code.every((c) => permissions.includes(c))
        : permissions.includes(code),
    hasAnyPermission: (codes) => codes.some((c) => permissions.includes(c)),
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider');
  return ctx;
}