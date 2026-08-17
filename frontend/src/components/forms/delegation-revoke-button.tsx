// 'use client';
// // src/components/forms/delegation-revoke-button.tsx
// //
// // Inline revoke button for a delegation.
// // POST /delegations/:id/revoke
// //
// // Single-field, low-complexity mutation → small inline control (not a full Card form).
// // Follows the pattern: Button + useRevokeDelegation mutation,
// // confirms via lightweight two-click toggle state (consistent with inline error pattern).

// import type { ReactNode } from 'react';
// import { useState } from 'react';
// import { useRevokeDelegation } from '@/lib/hooks/use-delegations';
// import { Button } from '@/components/ui/button';

// interface Props {
//   /** The delegation ID to revoke. */
//   delegationId: string;
//   /** Optional custom button text. */
//   children?: ReactNode;
//   /** Optional custom className for styling. */
//   className?: string;
//   /** Optional callback after successful revocation (for side effects). */
//   onSuccess?: () => void;
// }

// export function DelegationRevokeButton({
//   delegationId,
//   children,
//   className,
//   onSuccess,
// }: Props) {
//   const revokeDelegation = useRevokeDelegation();
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleConfirm() {
//     setShowConfirm(false);
//     setError(null);
//     try {
//       await revokeDelegation.mutateAsync(delegationId);
//       onSuccess?.();
//     } catch {
//       setError('Failed to revoke delegation. Please try again.');
//     }
//   }

//   function handleClick() {
//     if (revokeDelegation.isPending) return;
//     setShowConfirm(true);
//     setError(null);
//   }

//   if (showConfirm) {
//     return (
//       <span className="flex items-center gap-1">
//         <Button variant="destructive" size="icon" onClick={handleConfirm} disabled={revokeDelegation.isPending} title="Confirm revoke">
//           ✓
//         </Button>
//         <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={revokeDelegation.isPending} title="Cancel">
//           ✕
//         </Button>
//         {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
//       </span>
//     );
//   }

//   return (
//     <>
//       <Button
//         variant="destructive"
//         size="icon"
//         onClick={handleClick}
//         disabled={revokeDelegation.isPending}
//         className={className}
//         title="Revoke delegation"
//       >
//         {revokeDelegation.isPending ? '⏳' : children ?? '↩'}
//       </Button>
//       {error && <p className="text-sm text-destructive">{error}</p>}
//     </>
//   );
// }

'use client';
// src/components/forms/delegation-revoke-button.tsx
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRevokeDelegation } from '@/lib/hooks/use-delegations';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  delegationId: string;
  children?: ReactNode;
  className?: string;
  onSuccess?: () => void;
}

export function DelegationRevokeButton({
  delegationId,
  children,
  className,
  onSuccess,
}: Props) {
  const revokeDelegation = useRevokeDelegation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      await revokeDelegation.mutateAsync(delegationId);
      onSuccess?.();
    } catch {
      setError('Failed to revoke delegation. Please try again.');
    }
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (revokeDelegation.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="wait">
        {showConfirm ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 p-1 pr-2"
          >
            <span className="text-xs font-medium text-red-700 ml-2">Confirm?</span>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleConfirm}
              disabled={revokeDelegation.isPending}
              className="h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 shadow-sm"
              title="Confirm revoke"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(false)}
              disabled={revokeDelegation.isPending}
              className="h-7 w-7 rounded-full text-red-700 hover:bg-red-200 hover:text-red-800"
              title="Cancel"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={revokeDelegation.isPending}
              className={`h-8 rounded-full border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 ${className || ''}`}
              title="Revoke delegation"
            >
              {revokeDelegation.isPending ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {children ?? 'Revoke'}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="absolute right-0 top-full mt-1 text-xs text-red-500 whitespace-nowrap">{error}</p>}
    </div>
  );
}
