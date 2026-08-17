'use client';
// src/app/dashboard/requests/page.tsx
//
// ASSUMPTION, flagged: KeysetPage<T> shape assumed to be
// { items: T[]; nextCursor: string | null } — never independently confirmed
// against src/application/shared/pagination.ts. Adjust the two spots marked
// below if the real field names differ.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyRequests } from '@/lib/hooks/use-requests';
import { RequestSummaryView } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatSlaRisk } from '@/lib/format/duration';
import { SubmitRequestForm } from '@/components/forms/submit-request-form';

function stageBadgeVariant(stage: string): 'default' | 'secondary' {
  if (stage === 'COMPLETED' || stage === 'REJECTED' || stage === 'CANCELLED') return 'secondary';
  return 'default';
}

export default function RequestsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<RequestSummaryView[]>([]);

  const { data, isLoading, refetch } = useMyRequests(undefined, cursor);

  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      const fresh = data.items.filter((r) => !seen.has(r.id)); // ASSUMPTION: data.items
      return cursor ? [...prev, ...fresh] : data.items;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function handleSubmitSuccess() {
    setDialogOpen(false);
    setCursor(undefined);
    refetch();
  }

  function handleRowClick(req: RequestSummaryView) {
    // A request awaiting confirmation opens where it can still be changed.
    // Everything else opens read-only -- which is where the attachments are, so
    // this is also the only route by which a requester reaches the certificate
    // a clerk produced for them. While only the confirmation stage was
    // clickable, a finished request was a dead row.
    if (req.stage === 'AWAITING_CONFIRMATION') {
      router.push(`/dashboard/requests/${req.id}/edit`);
      return;
    }
    router.push(`/dashboard/requests/${req.id}`);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Requests</h1>
        <Button onClick={() => setDialogOpen(true)}>+ Submit New Request</Button>
      </div>

      {isLoading && items.length === 0 ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">You haven't submitted any requests yet.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference #</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Deadline status</TableHead>
                <TableHead>Deadline of step in progress</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req) => {
                const clickable = true;
                return (
                  <TableRow
                    key={req.id}
                    onClick={clickable ? () => handleRowClick(req) : undefined}
                    className={clickable ? 'cursor-pointer hover:bg-muted/50' : ''}
                  >
                    <TableCell>{req.referenceNo ?? '—'}</TableCell>
                    <TableCell><Badge variant={stageBadgeVariant(req.stage)}>{req.stage}</Badge></TableCell>
                    <TableCell>{req.priority}</TableCell>
                    <TableCell>
                      {req.outstandingPaymentCount ? (
                        <Badge variant="destructive">
                          {req.outstandingPaymentCount > 1
                            ? `${req.outstandingPaymentCount} fees due`
                            : 'Payment due'}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatSlaRisk(req.slaRisk)}</TableCell>
                    <TableCell>{req.slaDueAt ? new Date(req.slaDueAt).toLocaleString() : '—'}</TableCell>
                    <TableCell>{req.completedAt ? new Date(req.completedAt).toLocaleString() : '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {data?.nextCursor && ( 
            <Button variant="outline" onClick={() => setCursor(data.nextCursor!)}>
              Load more
            </Button>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit New Request</DialogTitle>
          </DialogHeader>
          <SubmitRequestForm onSuccess={handleSubmitSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { useRequest, useDocumentDownloadUrl, useStartWorkflow } from '@/lib/hooks/use-requests';
// import { usePermissions } from '@/lib/auth/permissions-provider';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { ActOnStepForm } from '@/components/forms/act-on-step-form';
// import { ChangePriorityForm } from '@/components/forms/change-priority-form';
// import { ConfirmPaymentButton } from '@/components/forms/confirm-payment-button';
// import { WaivePaymentForm } from '@/components/forms/waive-payment-form';
// import { Priority } from '@/types/request';

// function DocumentDownloadRow({ requestId, doc }: { requestId: string; doc: { id: string; fileName: string; fileSize: number; uploadedAt: string } }) {
//   const { data: downloadData, refetch, isFetching } = useDocumentDownloadUrl(requestId, doc.id);

//   async function handleDownload() {
//     const result = await refetch();
//     if (result.data?.url) {
//       window.open(result.data.url, '_blank');
//     }
//   }

//   return (
//     <div className="flex items-center justify-between p-3 border rounded-md">
//       <div>
//         <p className="font-medium text-sm">{doc.fileName}</p>
//         <p className="text-xs text-muted-foreground">
//           {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleString()}
//         </p>
//       </div>
//       <Button variant="outline" size="sm" onClick={handleDownload} disabled={isFetching}>
//         {isFetching ? 'Preparing…' : 'Download'}
//       </Button>
//     </div>
//   );
// }

// export default function RequestDetailPage() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const requestId = params.id;

//   const { data: request, isLoading } = useRequest(requestId);
//   const startWorkflow = useStartWorkflow();
//   const { hasPermission } = usePermissions();

//   const [actStepId, setActStepId] = useState<string | null>(null);
//   const [showPriorityDialog, setShowPriorityDialog] = useState(false);
//   const [waivePaymentId, setWaivePaymentId] = useState<string | null>(null);

//   if (isLoading) return <p className="p-6 text-muted-foreground">Loading request details…</p>;
//   if (!request) return <p className="p-6 text-destructive">Request not found.</p>;

//   const canAct = hasPermission('request.act');
//   const canSettlePayment = hasPermission('payment.settle');

//   return (
//     <div className="space-y-6 p-6 max-w-5xl mx-auto">
//       {/* Top Bar with Back Button */}
//       <div className="flex items-center justify-between">
//         <Button variant="outline" onClick={() => router.back()}>
//           ← Back
//         </Button>
//         <div className="flex items-center gap-2">
//           {canAct && request.stage === 'READY_TO_START' && (
//             <Button
//               onClick={() => startWorkflow.mutateAsync(requestId)}
//               disabled={startWorkflow.isPending}
//             >
//               {startWorkflow.isPending ? 'Starting Workflow…' : 'Start Workflow'}
//             </Button>
//           )}
//           {canAct && (
//             <Dialog open={showPriorityDialog} onOpenChange={setShowPriorityDialog}>
//               <DialogTrigger>
//                 <Button variant="outline">Change Priority</Button>
//               </DialogTrigger>
//               <DialogContent className="max-w-xl">
//                 <ChangePriorityForm
//                   requestId={requestId}
//                   currentPriority={request.priority as Priority}
//                 />
//               </DialogContent>
//             </Dialog>
//           )}
//         </div>
//       </div>

//       {/* Request Header Summary */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle>Request #{request.referenceNo ?? request.id.slice(0, 8)}</CardTitle>
//             <Badge variant={request.stage === 'COMPLETED' ? 'secondary' : 'default'}>
//               {request.stage}
//             </Badge>
//           </div>
//           <CardDescription>
//             Priority: <span className="font-semibold">{request.priority}</span> | SLA Risk: <span className="font-semibold">{request.slaRisk}</span>
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {request.rawText && (
//             <div>
//               <h3 className="text-sm font-medium text-muted-foreground mb-1">Citizen Description</h3>
//               <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{request.rawText}</p>
//             </div>
//           )}

//           {request.template && (
//             <div>
//               <h3 className="text-sm font-medium text-muted-foreground mb-1">Template</h3>
//               <p className="text-sm font-semibold">{request.template.titleAr} {request.template.titleEn && `(${request.template.titleEn})`}</p>
//             </div>
//           )}

//           {request.filledData && Object.keys(request.filledData).length > 0 && (
//             <div>
//               <h3 className="text-sm font-medium text-muted-foreground mb-1">Filled Data</h3>
//               <div className="grid grid-cols-2 gap-2 bg-muted p-3 rounded-md text-sm">
//                 {Object.entries(request.filledData).map(([key, val]) => (
//                   <div key={key}>
//                     <span className="font-medium text-muted-foreground">{key}:</span> {String(val)}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Step Instances & Actions */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Workflow Steps</CardTitle>
//           <CardDescription>Progress and assigned actions for each workflow step.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {!request.stepInstances || request.stepInstances.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No workflow steps initiated yet.</p>
//           ) : (
//             request.stepInstances.map((step) => {
//               const isAssignedToMe = step.assignedToUserId; // or check current user ID if needed
//               return (
//                 <div key={step.id} className="border p-4 rounded-md space-y-3">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <span className="text-xs font-mono text-muted-foreground">Step ID: {step.id}</span>
//                       <p className="text-sm font-semibold">Status: {step.status}</p>
//                     </div>
//                     <Badge variant={step.status === 'DONE' ? 'secondary' : 'default'}>
//                       {step.status}
//                     </Badge>
//                   </div>

//                   {canAct && step.status !== 'DONE' && step.status !== 'REJECTED' && step.status !== 'SKIPPED' && (
//                     <div className="pt-2 flex gap-2">
//                       <Dialog>
//                         <DialogTrigger>
//                           <Button size="sm">Act on Step</Button>
//                         </DialogTrigger>
//                         <DialogContent className="max-w-xl">
//                           <ActOnStepForm
//                             requestId={requestId}
//                             stepId={step.id}
//                             currentStepStatus={step.status}
//                           />
//                         </DialogContent>
//                       </Dialog>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </CardContent>
//       </Card>

//       {/* Payments Section */}
//       {request.payments && request.payments.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Payments & Fees</CardTitle>
//             <CardDescription>Associated fees required for workflow steps.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {request.payments.map((payment) => (
//               <div key={payment.id} className="flex items-center justify-between p-3 border rounded-md">
//                 <div>
//                   <p className="text-sm font-medium">
//                     Amount: {payment.amount} {payment.currency}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Status: <span className="font-semibold">{payment.status}</span>
//                   </p>
//                 </div>
//                 {canSettlePayment && payment.status !== 'CONFIRMED' && payment.status !== 'WAIVED' && (
//                   <div className="flex items-center gap-2">
//                     <ConfirmPaymentButton requestId={requestId} paymentId={payment.id} />
//                     <Dialog>
//                       <DialogTrigger>
//                         <Button variant="outline" size="sm">Waive</Button>
//                       </DialogTrigger>
//                       <DialogContent className="max-w-xl">
//                         <WaivePaymentForm requestId={requestId} paymentId={payment.id} />
//                       </DialogContent>
//                     </Dialog>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}

//       {/* Documents Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Documents</CardTitle>
//           <CardDescription>Attachments and uploaded files.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-2">
//           {!request.documents || request.documents.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No documents attached.</p>
//           ) : (
//             request.documents.map((doc) => (
//               <DocumentDownloadRow key={doc.id} requestId={requestId} doc={doc} />
//             ))
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }