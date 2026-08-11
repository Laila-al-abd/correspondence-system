// import { PermissionsProvider } from '@/lib/auth/permissions-provider';
// import { DashboardHeader } from '@/components/dashboard-header';
// import { NotificationToastProvider } from '@/components/notification-toast-provider';

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <PermissionsProvider>
//       <DashboardHeader />
//       {children}
//       <NotificationToastProvider />
//     </PermissionsProvider>
//   );
// }



import { PermissionsProvider } from '@/lib/auth/permissions-provider';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { NotificationToastProvider } from '@/components/notification-toast-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionsProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <NotificationToastProvider />
    </PermissionsProvider>
  );
}