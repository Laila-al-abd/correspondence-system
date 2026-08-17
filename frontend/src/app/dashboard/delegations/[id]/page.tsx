// 'use client';
// // src/app/dashboard/delegations/[id]/page.tsx
// //
// // Detail view for a single delegation. Uses useParams() per this project's
// // convention rather than a params prop, to sidestep any async-params
// // ambiguity elsewhere in this Next.js version.

// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { useDelegation } from '@/lib/hooks/use-delegations';
// import { PermissionGate } from '@/components/permission-gate';
// import { DelegationRevokeButton } from '@/components/forms/delegation-revoke-button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';

// function formatDate(value: string): string {
//   const d = new Date(value);
//   return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
// }

// function DelegationDetailContent() {
//   const params = useParams<{ id: string }>();
//   const { data: delegation, isLoading, isError } = useDelegation(params.id);

//   if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
//   if (isError || !delegation)
//     return <p className="p-6 text-destructive">Delegation not found.</p>;

//   return (
//     <div className="p-6 space-y-4">
//       <Link
//         href="/dashboard/delegations"
//         className="text-sm font-medium hover:underline"
//         style={{ color: 'var(--ics-accent)' }}
//       >
//         ← Back to delegations
//       </Link>

//       <Card className="max-w-xl">
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div className="flex items-center gap-3">
//             <CardTitle style={{ color: 'var(--ics-primary)' }}>
//               Delegation details
//             </CardTitle>
//             <span
//               className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
//               style={{
//                 backgroundColor: delegation.isActive
//                   ? 'var(--ics-primary)'
//                   : 'color-mix(in srgb, var(--ics-text) 35%, transparent)',
//               }}
//             >
//               {delegation.isActive ? 'Active' : 'Revoked'}
//             </span>
//           </div>
//           {delegation.isActive && <DelegationRevokeButton delegationId={delegation.id} />}
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <p className="text-xs font-medium text-muted-foreground uppercase">
//               Delegator
//             </p>
//             <p>
//               {delegation.delegatorName.ar}
//               {delegation.delegatorName.en && ` (${delegation.delegatorName.en})`}
//             </p>
//           </div>
//           <div>
//             <p className="text-xs font-medium text-muted-foreground uppercase">
//               Delegate
//             </p>
//             <p>
//               {delegation.delegateName.ar}
//               {delegation.delegateName.en && ` (${delegation.delegateName.en})`}
//             </p>
//           </div>

//           <Separator />

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="text-xs font-medium text-muted-foreground uppercase">
//                 Start date
//               </p>
//               <p>{formatDate(delegation.startDate)}</p>
//             </div>
//             <div>
//               <p className="text-xs font-medium text-muted-foreground uppercase">
//                 End date
//               </p>
//               <p>{formatDate(delegation.endDate)}</p>
//             </div>
//           </div>

//           <div>
//             <p className="text-xs font-medium text-muted-foreground uppercase">
//               Reason
//             </p>
//             <p>{delegation.reason ?? 'No reason given.'}</p>
//           </div>

//           <p className="text-xs text-muted-foreground pt-2">
//             Created {formatDate(delegation.createdAt)} · ID: {delegation.id}
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default function DelegationDetailPage() {
//   return (
//     <PermissionGate require="user.manage">
//       <DelegationDetailContent />
//     </PermissionGate>
//   );
// }

'use client';
// src/app/dashboard/delegations/[id]/page.tsx
//
// Detail view for a single delegation. Uses useParams() per this project's
// convention rather than a params prop, to sidestep any async-params
// ambiguity elsewhere in this Next.js version.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, User, Calendar, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useDelegation } from '@/lib/hooks/use-delegations';
import { PermissionGate } from '@/components/permission-gate';
import { DelegationRevokeButton } from '@/components/forms/delegation-revoke-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function DelegationDetailContent() {
  const params = useParams<{ id: string }>();
  const { data: delegation, isLoading, isError } = useDelegation(params.id);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-(--ics-background) p-6 sm:p-10">
        <div className="mx-auto max-w-2xl flex items-center gap-3 text-(--ics-primary)">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (isError || !delegation) {
    return (
      <div className="relative min-h-screen bg-(--ics-background) p-6 sm:p-10">
        <div className="mx-auto max-w-2xl flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-red-600">
          <ShieldAlert className="h-6 w-6" />
          <p className="font-medium">Delegation not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-(--ics-background) overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[10%] h-[40%] w-[40%] rounded-full bg-(--ics-secondary) opacity-[0.12] blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] h-[50%] w-[40%] rounded-full bg-(--ics-primary) opacity-[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl space-y-8 p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/dashboard/delegations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--ics-accent) transition-colors hover:text-(--ics-primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to delegations
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="overflow-hidden border-2 border-(--ics-accent)/10 bg-white/70 shadow-2xl shadow-(--ics-primary)/5 backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--ics-accent)/10 bg-(--ics-primary)/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-(--ics-accent)/20">
                  <CheckCircle2 className="h-6 w-6 text-(--ics-primary)" />
                </div>
                <div>
                  <CardTitle className="text-xl font-extrabold text-(--ics-primary)">
                    Delegation Details
                  </CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-xs text-(--ics-text)/60">
                    <span className="font-mono">ID: {delegation.id}</span>
                    <span>•</span>
                    <span>Created {formatDate(delegation.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    delegation.isActive
                      ? 'bg-(--ics-primary)/10 text-(--ics-primary) border border-(--ics-primary)/20'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {delegation.isActive ? 'Active' : 'Revoked'}
                </span>
                {delegation.isActive && <DelegationRevokeButton delegationId={delegation.id} />}
              </div>
            </CardHeader>

            <CardContent className="grid gap-8 p-6 sm:p-8">
              {/* Users Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 rounded-xl bg-gray-50/80 p-5 ring-1 ring-black/5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--ics-accent)">
                    <User className="h-4 w-4" /> Delegator
                  </p>
                  <p className="text-base font-semibold text-(--ics-text)">
                    {delegation.delegatorName.ar}
                    {delegation.delegatorName.en && <span className="block text-sm font-medium text-(--ics-text)/60">{delegation.delegatorName.en}</span>}
                  </p>
                </div>
                <div className="space-y-2 rounded-xl bg-(--ics-primary)/5 p-5 ring-1 ring-(--ics-primary)/10">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--ics-primary)">
                    <User className="h-4 w-4" /> Delegate
                  </p>
                  <p className="text-base font-semibold text-(--ics-text)">
                    {delegation.delegateName.ar}
                    {delegation.delegateName.en && <span className="block text-sm font-medium text-(--ics-text)/60">{delegation.delegateName.en}</span>}
                  </p>
                </div>
              </div>

              <Separator className="bg-(--ics-accent)/10" />

              {/* Dates Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--ics-text)/50">
                    <Calendar className="h-4 w-4 text-(--ics-accent)" /> Start Date
                  </p>
                  <p className="text-base font-medium text-(--ics-text)">{formatDate(delegation.startDate)}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--ics-text)/50">
                    <Calendar className="h-4 w-4 text-(--ics-accent)" /> End Date
                  </p>
                  <p className="text-base font-medium text-(--ics-text)">{formatDate(delegation.endDate)}</p>
                </div>
              </div>

              <Separator className="bg-(--ics-accent)/10" />

              {/* Reason */}
              <div className="space-y-2 rounded-xl border border-(--ics-accent)/10 bg-white p-5 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--ics-text)/50">
                  <FileText className="h-4 w-4 text-(--ics-accent)" /> Reason for Delegation
                </p>
                <p className="text-sm leading-relaxed text-(--ics-text)/80">
                  {delegation.reason ?? 'No specific reason was provided for this delegation.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function DelegationDetailPage() {
  return (
    <PermissionGate require="user.manage">
      <DelegationDetailContent />
    </PermissionGate>
  );
}
