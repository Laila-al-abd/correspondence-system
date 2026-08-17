// // src/app/dashboard/delegations/new/page.tsx
// import Link from 'next/link';
// import { PermissionGate } from '@/components/permission-gate';
// import { DelegationForm } from '@/components/forms/delegation-form';

// export default function NewDelegationPage() {
//   return (
//     <PermissionGate require="user.manage">
//       <div className="p-6 space-y-4">
//         <Link
//           href="/dashboard/delegations"
//           className="text-sm font-medium hover:underline"
//           style={{ color: 'var(--ics-accent)' }}
//         >
//           ← Back to delegations
//         </Link>
//         <DelegationForm />
//       </div>
//     </PermissionGate>
//   );
// }
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { PermissionGate } from '@/components/permission-gate';
import { DelegationForm } from '@/components/forms/delegation-form';

export default function NewDelegationPage() {
  return (
    <PermissionGate require="user.manage">
      <div className="relative min-h-screen bg-(--ics-background) overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-(--ics-secondary) opacity-[0.1] blur-[100px]" />
          <div className="absolute bottom-[20%] right-[-15%] h-[60%] w-[50%] rounded-full bg-(--ics-primary) opacity-[0.08] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl space-y-8 p-6 sm:p-10">
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
            <div className="rounded-2xl border-2 border-(--ics-accent)/10 bg-white/70 p-8 shadow-xl shadow-(--ics-primary)/5 backdrop-blur-md">
              <div className="mb-8 flex items-center gap-3 border-b border-(--ics-accent)/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--ics-primary)/10">
                  <UserPlus className="h-5 w-5 text-(--ics-primary)" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-(--ics-primary)">
                    New Delegation
                  </h1>
                  <p className="text-sm text-(--ics-text)/70">
                    Transfer authorization responsibilities to another user.
                  </p>
                </div>
              </div>
              
              <DelegationForm />
            </div>
          </motion.div>
        </div>
      </div>
    </PermissionGate>
  );
}
