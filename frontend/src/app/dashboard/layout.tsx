// src/app/dashboard/layout.tsx
import { PermissionsProvider } from '@/lib/auth/permissions-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PermissionsProvider>{children}</PermissionsProvider>;
}