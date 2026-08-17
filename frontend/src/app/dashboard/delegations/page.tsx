// 'use client';
// // src/app/dashboard/delegations/page.tsx
// //
// // List of delegations. Permission: 'user.manage' -- confirmed from the
// // class-level @RequirePermissions('user.manage') on DelegationsController,
// // which applies to every route on that controller.

// import { useRouter } from 'next/navigation';
// import { useDelegations } from '@/lib/hooks/use-delegations';
// import { PermissionGate } from '@/components/permission-gate';
// import { DelegationRevokeButton } from '@/components/forms/delegation-revoke-button';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableHead,
//   TableCell,
// } from '@/components/ui/table';

// function formatDate(value: string): string {
//   const d = new Date(value);
//   return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
// }

// function DelegationsPageContent() {
//   const router = useRouter();
//   // Simple table per the request -- no pagination controls yet. If the
//   // list grows past this page size, add Prev/Next wired to page/pageSize.
//   const { data, isLoading, isError } = useDelegations(1, 50);
//   const delegations = data?.items ?? [];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
//           Delegations
//         </h1>
//         <Button
//           onClick={() => router.push('/dashboard/delegations/new')}
//           className="text-white hover:opacity-90 transition-opacity"
//           style={{ backgroundColor: 'var(--ics-primary)' }}
//         >
//           Add Delegation
//         </Button>
//       </div>

//       {isLoading && <p className="text-muted-foreground">Loading…</p>}
//       {isError && <p className="text-destructive">Failed to load delegations.</p>}

//       {!isLoading && !isError && delegations.length === 0 && (
//         <p className="text-muted-foreground">No delegations yet.</p>
//       )}

//       {!isLoading && !isError && delegations.length > 0 && (
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Delegator</TableHead>
//               <TableHead>Delegate</TableHead>
//               <TableHead>Start date</TableHead>
//               <TableHead>End date</TableHead>
//               <TableHead>Reason</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {delegations.map((d) => (
//               <TableRow
//                 key={d.id}
//                 className="cursor-pointer hover:bg-muted/50"
//                 onClick={() => router.push(`/dashboard/delegations/${d.id}`)}
//               >
//                 <TableCell>
//                   {d.delegatorName.ar}
//                   {d.delegatorName.en && ` (${d.delegatorName.en})`}
//                 </TableCell>
//                 <TableCell>
//                   {d.delegateName.ar}
//                   {d.delegateName.en && ` (${d.delegateName.en})`}
//                 </TableCell>
//                 <TableCell>{formatDate(d.startDate)}</TableCell>
//                 <TableCell>{formatDate(d.endDate)}</TableCell>
//                 <TableCell className="max-w-48 truncate">
//                   {d.reason ?? '—'}
//                 </TableCell>
//                 <TableCell>
//                   <span
//                     className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
//                     style={{
//                       backgroundColor: d.isActive
//                         ? 'var(--ics-primary)'
//                         : 'color-mix(in srgb, var(--ics-text) 35%, transparent)',
//                     }}
//                   >
//                     {d.isActive ? 'Active' : 'Revoked'}
//                   </span>
//                 </TableCell>
//                 <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
//                   {/* Only offer revoke on a still-active delegation -- revoking
//                       an already-revoked one has no meaningful action to confirm. */}
//                   {d.isActive && <DelegationRevokeButton delegationId={d.id} />}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       )}
//     </div>
//   );
// }

// export default function DelegationsPage() {
//   return (
//     <PermissionGate require="user.manage">
//       <DelegationsPageContent />
//     </PermissionGate>
//   );
// }
'use client';
// src/app/dashboard/delegations/page.tsx
//
// List of delegations. Permission: 'user.manage' -- confirmed from the
// class-level @RequirePermissions('user.manage') on DelegationsController,
// which applies to every route on that controller.

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Users, Plus, ArrowRight, ShieldAlert, FileText, Clock } from 'lucide-react';
import { useDelegations } from '@/lib/hooks/use-delegations';
import { PermissionGate } from '@/components/permission-gate';
import { DelegationRevokeButton } from '@/components/forms/delegation-revoke-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function DelegationsPageContent() {
  const router = useRouter();
  // Simple table per the request -- no pagination controls yet. If the
  // list grows past this page size, add Prev/Next wired to page/pageSize.
  const { data, isLoading, isError } = useDelegations(1, 50);
  const delegations = data?.items ?? [];

  return (
    <div className="relative min-h-screen bg-(--ics-background) overflow-hidden">
      {/* Ambient Background matching the theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-(--ics-secondary) opacity-[0.1] blur-[100px]" />
        <div className="absolute top-[40%] right-[-15%] h-[60%] w-[50%] rounded-full bg-(--ics-primary) opacity-[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-8 p-6 sm:p-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-(--ics-primary)">
              <Users className="h-8 w-8" strokeWidth={2.5} />
              Delegations
            </h1>
            <p className="mt-2 text-base text-(--ics-text)/70 max-w-2xl">
              Manage temporary authorization transfers between users.
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/dashboard/delegations/new')}
            className="group h-11 rounded-full bg-(--ics-primary) px-6 text-white shadow-md shadow-(--ics-primary)/20 transition-all hover:bg-(--ics-primary)/90 hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-semibold">Add Delegation</span>
          </Button>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {isLoading && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-(--ics-accent)/10 bg-white/70 p-10 text-(--ics-primary) backdrop-blur-md">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <p className="font-medium">Loading delegations...</p>
            </div>
          )}
          
          {isError && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-10 text-red-600">
              <ShieldAlert className="h-6 w-6" />
              <p className="font-medium">Failed to load delegations. Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && delegations.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--ics-accent)/20 bg-white/40 p-12 text-center backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-(--ics-primary)/10 p-4">
                <FileText className="h-8 w-8 text-(--ics-primary)" />
              </div>
              <h3 className="text-lg font-semibold text-(--ics-text)">No delegations yet</h3>
              <p className="mt-2 text-sm text-(--ics-text)/60 max-w-sm">
                You haven't created any delegations. Click the Add Delegation button to get started.
              </p>
            </div>
          )}

          {!isLoading && !isError && delegations.length > 0 && (
            <Card className="overflow-hidden border-2 border-(--ics-accent)/10 bg-white/70 shadow-xl shadow-(--ics-primary)/5 backdrop-blur-md">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-(--ics-primary)/5">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-(--ics-primary)">Delegator</TableHead>
                      <TableHead className="font-semibold text-(--ics-primary)">Delegate</TableHead>
                      <TableHead className="font-semibold text-(--ics-primary)">Start Date</TableHead>
                      <TableHead className="font-semibold text-(--ics-primary)">End Date</TableHead>
                      <TableHead className="font-semibold text-(--ics-primary)">Reason</TableHead>
                      <TableHead className="font-semibold text-(--ics-primary)">Status</TableHead>
                      <TableHead className="text-right font-semibold text-(--ics-primary)">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delegations.map((d, index) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        key={d.id}
                        className="group cursor-pointer border-b border-(--ics-accent)/10 transition-colors hover:bg-(--ics-primary)/5"
                        onClick={() => router.push(`/dashboard/delegations/${d.id}`)}
                      >
                        <TableCell className="font-medium text-(--ics-text)">
                          {d.delegatorName.ar}
                          {d.delegatorName.en && <span className="text-(--ics-text)/60 font-normal"> ({d.delegatorName.en})</span>}
                        </TableCell>
                        <TableCell className="font-medium text-(--ics-text)">
                          {d.delegateName.ar}
                          {d.delegateName.en && <span className="text-(--ics-text)/60 font-normal"> ({d.delegateName.en})</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-(--ics-text)/80">
                            <Clock className="h-3.5 w-3.5 text-(--ics-accent)" />
                            {formatDate(d.startDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-(--ics-text)/80">
                            <Clock className="h-3.5 w-3.5 text-(--ics-accent)" />
                            {formatDate(d.endDate)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-48">
                          <span className="block truncate text-sm text-(--ics-text)/70">
                            {d.reason ?? '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              d.isActive
                                ? 'bg-(--ics-primary)/10 text-(--ics-primary) border border-(--ics-primary)/20'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {d.isActive ? 'Active' : 'Revoked'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {/* Only offer revoke on a still-active delegation */}
                            {d.isActive ? (
                              <DelegationRevokeButton delegationId={d.id} />
                            ) : (
                              <span className="text-xs text-muted-foreground mr-2">Inactive</span>
                            )}
                            <div className="flex h-8 w-8 items-center justify-center rounded-full text-(--ics-accent) transition-colors group-hover:bg-(--ics-primary)/10">
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function DelegationsPage() {
  return (
    <PermissionGate require="user.manage">
      <DelegationsPageContent />
    </PermissionGate>
  );
}
