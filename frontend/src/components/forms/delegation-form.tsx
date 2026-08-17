// 'use client';
// // src/components/forms/delegation-form.tsx
// //
// // Form for granting a new delegation.
// // POST /delegations
// //
// // Notes:
// // - delegatorId and delegateId are UUIDs referencing User entities.
// //   Real listing endpoint exists (GET /users) → dropdowns (Case a).
// // - startDate and endDate are inclusive calendar dates (YYYY-MM-DD).
// //   Backend validates @IsDateString() and that end >= start.
// // - reason is optional, max 500 chars.
// // - No update route exists (no PATCH /delegations/:id) → create-only form.

// import { useState, FormEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import { useGrantDelegation } from '@/lib/hooks/use-delegations';
// import { useUsers } from '@/lib/hooks/use-users';
// import { GrantDelegationDto, UserSummaryView } from '@/types/identity';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';

// const selectClass =
//   'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

// interface Props {
//   /** Optional existing delegation to edit — not used (no update route). */
//   existing?: never;
// }

// function formatDateForInput(date: Date): string {
//   return date.toISOString().split('T')[0];
// }

// function tomorrow(): string {
//   const d = new Date();
//   d.setDate(d.getDate() + 1);
//   return formatDateForInput(d);
// }

// function nextMonth(): string {
//   const d = new Date();
//   d.setMonth(d.getMonth() + 1);
//   return formatDateForInput(d);
// }

// export function DelegationForm({ existing }: Props) {
//   const router = useRouter();
//   const grantDelegation = useGrantDelegation();

//   // Fetch all users for both dropdowns (unfiltered, no pagination for selection)
//   // Note: useUsers supports page/pageSize; we fetch a large page to get all users.
//   // The backend clamps pageSize to 1..200; if there are more than 200 users,
//   // the dropdown will be incomplete. A dedicated "list all users" endpoint would
//   // be better, but this works for typical admin counts.
//   const { data: usersPage } = useUsers(1, 200);
//   const users = usersPage?.items ?? [];

//   const [delegatorId, setDelegatorId] = useState<string>('');
//   const [delegateId, setDelegateId] = useState<string>('');
//   const [startDate, setStartDate] = useState<string>(formatDateForInput(new Date()));
//   const [endDate, setEndDate] = useState<string>(nextMonth());
//   const [reason, setReason] = useState<string>('');
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   const selectedDelegator = users.find((u) => u.id === delegatorId);
//   const selectedDelegate = users.find((u) => u.id === delegateId);
//   const isPending = grantDelegation.isPending;

//   function getUserLabel(user: UserSummaryView): string {
//     const en = user.fullNameEn ?? '';
//     return `${user.fullNameAr}${en ? ` (${en})` : ''} — ${user.email}`;
//   }

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setSubmitError(null);

//     if (!delegatorId) {
//       setSubmitError('Delegator is required.');
//       return;
//     }
//     if (!delegateId) {
//       setSubmitError('Delegate is required.');
//       return;
//     }
//     if (delegatorId === delegateId) {
//       setSubmitError('A user cannot delegate to themselves.');
//       return;
//     }
//     if (!startDate) {
//       setSubmitError('Start date is required.');
//       return;
//     }
//     if (!endDate) {
//       setSubmitError('End date is required.');
//       return;
//     }
//     if (endDate < startDate) {
//       setSubmitError('End date must be on or after start date.');
//       return;
//     }
//     if (reason.length > 500) {
//       setSubmitError('Reason must be 500 characters or fewer.');
//       return;
//     }

//     const request: GrantDelegationDto = {
//       delegatorId,
//       delegateId,
//       startDate,
//       endDate,
//       reason: reason.trim() || undefined,
//     };

//     try {
//       await grantDelegation.mutateAsync(request);
//       router.push('/dashboard/delegations');
//     } catch {
//       setSubmitError('Failed to grant delegation. Please check the values and try again.');
//     }
//   }

//   return (
//     <Card className="w-full max-w-xl">
//       <CardHeader>
//         <CardTitle>Grant Delegation</CardTitle>
//         <CardDescription>
//           Authorize one user to act on behalf of another for a specific date window.
//           Delegation is limited to one step: a delegate cannot pass the authority on.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Delegator dropdown — Case (a): real listing endpoint exists */}
//           <div className="space-y-1">
//             <Label htmlFor="delegatorId">Delegator <span className="text-destructive">*</span></Label>
//             <select
//               id="delegatorId"
//               className={selectClass}
//               value={delegatorId}
//               onChange={(e) => setDelegatorId(e.target.value)}
//               disabled={isPending}
//               required
//             >
//               <option value="">— select user —</option>
//               {users.map((u) => (
//                 <option key={u.id} value={u.id}>
//                   {getUserLabel(u)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Delegate dropdown — Case (a): real listing endpoint exists */}
//           <div className="space-y-1">
//             <Label htmlFor="delegateId">Delegate <span className="text-destructive">*</span></Label>
//             <select
//               id="delegateId"
//               className={selectClass}
//               value={delegateId}
//               onChange={(e) => setDelegateId(e.target.value)}
//               disabled={isPending}
//               required
//             >
//               <option value="">— select user —</option>
//               {users.map((u) => (
//                 <option key={u.id} value={u.id}>
//                   {getUserLabel(u)}
//                 </option>
//               ))}
//             </select>
//             {delegateId && delegateId === delegatorId && (
//               <p className="text-sm text-destructive">A user cannot delegate to themselves.</p>
//             )}
//           </div>

//           <Separator />

//           {/* Date window */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="space-y-1">
//               <Label htmlFor="startDate">Start date <span className="text-destructive">*</span></Label>
//               <Input
//                 id="startDate"
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 disabled={isPending}
//                 required
//                 min={formatDateForInput(new Date())}
//               />
//             </div>
//             <div className="space-y-1">
//               <Label htmlFor="endDate">End date <span className="text-destructive">*</span></Label>
//               <Input
//                 id="endDate"
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 disabled={isPending}
//                 required
//                 min={startDate || formatDateForInput(new Date())}
//               />
//             </div>
//           </div>

//           <p className="text-xs text-muted-foreground">
//             Both dates are inclusive. The delegation becomes active at start of start date and expires
//             at end of end date (server timezone).
//           </p>

//           {/* Optional reason */}
//           <div className="space-y-1">
//             <Label htmlFor="reason">Reason (optional, max 500 chars)</Label>
//             <textarea
//               id="reason"
//               className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
//               placeholder="Why is this delegation needed?"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               disabled={isPending}
//               maxLength={500}
//             />
//             <p className="text-xs text-muted-foreground">
//               {reason.length}/500 characters
//             </p>
//           </div>

//           {submitError && <p className="text-sm text-destructive">{submitError}</p>}

//           <div className="flex gap-2 pt-2">
//             <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
//               {isPending ? 'Granting…' : 'Grant Delegation'}
//             </Button>
//             <Button type="button" variant="outline" onClick={() => router.push('/dashboard/delegations')} disabled={isPending}>
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }

'use client';
// src/components/forms/delegation-form.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useGrantDelegation } from '@/lib/hooks/use-delegations';
import { useUsers } from '@/lib/hooks/use-users';
import { GrantDelegationDto, UserSummaryView } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-11 w-full rounded-xl border border-(--ics-accent)/20 bg-white/50 px-3 py-2 text-sm text-(--ics-text) shadow-sm backdrop-blur-sm transition-colors focus:border-(--ics-primary) focus:outline-none focus:ring-1 focus:ring-(--ics-primary)';

interface Props {
  existing?: never;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function nextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return formatDateForInput(d);
}

export function DelegationForm({ existing }: Props) {
  const router = useRouter();
  const grantDelegation = useGrantDelegation();
  const { data: usersPage } = useUsers(1, 200);
  const users = usersPage?.items ?? [];

  const [delegatorId, setDelegatorId] = useState<string>('');
  const [delegateId, setDelegateId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(formatDateForInput(new Date()));
  const [endDate, setEndDate] = useState<string>(nextMonth());
  const [reason, setReason] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = grantDelegation.isPending;

  function getUserLabel(user: UserSummaryView): string {
    const en = user.fullNameEn ?? '';
    return `${user.fullNameAr}${en ? ` (${en})` : ''} — ${user.email}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!delegatorId || !delegateId) {
      setSubmitError('Delegator and Delegate are required.');
      return;
    }
    if (delegatorId === delegateId) {
      setSubmitError('A user cannot delegate to themselves.');
      return;
    }
    if (!startDate || !endDate) {
      setSubmitError('Start and end dates are required.');
      return;
    }
    if (endDate < startDate) {
      setSubmitError('End date must be on or after start date.');
      return;
    }
    if (reason.length > 500) {
      setSubmitError('Reason must be 500 characters or fewer.');
      return;
    }

    const request: GrantDelegationDto = {
      delegatorId,
      delegateId,
      startDate,
      endDate,
      reason: reason.trim() || undefined,
    };

    try {
      await grantDelegation.mutateAsync(request);
      router.push('/dashboard/delegations');
    } catch {
      setSubmitError('Failed to grant delegation. Please check the values and try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Delegator dropdown */}
      <div className="space-y-1.5">
        <Label htmlFor="delegatorId" className="text-sm font-medium text-(--ics-text)/80">
          Delegator <span className="text-red-500">*</span>
        </Label>
        <select
          id="delegatorId"
          className={selectClass}
          value={delegatorId}
          onChange={(e) => setDelegatorId(e.target.value)}
          disabled={isPending}
          required
        >
          <option value="">— Select Delegator User —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {getUserLabel(u)}
            </option>
          ))}
        </select>
      </div>

      {/* Delegate dropdown */}
      <div className="space-y-1.5">
        <Label htmlFor="delegateId" className="text-sm font-medium text-(--ics-text)/80">
          Delegate <span className="text-red-500">*</span>
        </Label>
        <select
          id="delegateId"
          className={selectClass}
          value={delegateId}
          onChange={(e) => setDelegateId(e.target.value)}
          disabled={isPending}
          required
        >
          <option value="">— Select Delegate User —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {getUserLabel(u)}
            </option>
          ))}
        </select>
        {delegateId && delegateId === delegatorId && (
          <p className="text-sm font-medium text-red-500 mt-1">A user cannot delegate to themselves.</p>
        )}
      </div>

      <Separator className="bg-(--ics-accent)/10 my-6" />

      {/* Date window */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-sm font-medium text-(--ics-text)/80">
            Start date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isPending}
            required
            min={formatDateForInput(new Date())}
            className="h-11 rounded-xl border-(--ics-accent)/20 bg-white/50 focus-visible:ring-(--ics-primary)"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-sm font-medium text-(--ics-text)/80">
            End date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isPending}
            required
            min={startDate || formatDateForInput(new Date())}
            className="h-11 rounded-xl border-(--ics-accent)/20 bg-white/50 focus-visible:ring-(--ics-primary)"
          />
        </div>
      </div>
      <p className="text-xs text-(--ics-text)/60">
        Both dates are inclusive. The delegation becomes active at start of start date and expires at end of end date.
      </p>

      {/* Optional reason */}
      <div className="space-y-1.5">
        <Label htmlFor="reason" className="text-sm font-medium text-(--ics-text)/80">
          Reason (optional, max 500 chars)
        </Label>
        <textarea
          id="reason"
          className="flex min-h-20 w-full rounded-xl border border-(--ics-accent)/20 bg-white/50 px-4 py-3 text-sm text-(--ics-text) shadow-sm backdrop-blur-sm placeholder:text-(--ics-text)/40 focus-visible:border-(--ics-primary) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--ics-primary) disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Why is this delegation needed?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isPending}
          maxLength={500}
        />
        <p className="text-xs text-(--ics-text)/60 text-right">
          {reason.length}/500 characters
        </p>
      </div>

      {submitError && <p className="text-sm font-medium text-red-500">{submitError}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full sm:w-auto h-11 rounded-xl bg-(--ics-primary) px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-(--ics-primary)/90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isPending ? 'Granting…' : 'Grant Delegation'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard/delegations')} 
          disabled={isPending}
          className="w-full sm:w-auto h-11 rounded-xl border-2 border-(--ics-accent)/20 bg-white/50 text-(--ics-primary) hover:bg-(--ics-accent)/5 hover:border-(--ics-accent)/40 transition-all"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
