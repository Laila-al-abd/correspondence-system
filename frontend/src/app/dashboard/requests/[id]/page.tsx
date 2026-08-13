'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRequest, useDocumentDownloadUrl, useStartWorkflow } from '@/lib/hooks/use-requests';
import { useUsers as useUsersList } from '@/lib/hooks/use-users';
import { usePermissions } from '@/lib/auth/permissions-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Forms & Action components
import { ActOnStepForm } from '@/components/forms/act-on-step-form';
import { AssignStepForm } from '@/components/forms/assign-step-form';
import { ChangePriorityForm } from '@/components/forms/change-priority-form';
import { ConfirmPaymentButton } from '@/components/forms/confirm-payment-button';
import { WaivePaymentForm } from '@/components/forms/waive-payment-form';
import { UploadDocumentForm } from '@/components/forms/upload-document-form';
import { DocumentDownloadButton } from '@/components/forms/document-download-button';
import { Priority } from '@/types/request';

/** Component that resolves raw UUIDs into friendly Employee / User names */
function AssigneeName({ userId }: { userId?: string }) {
  const { data: usersData, isLoading } = useUsersList(1, 100);

  if (!userId) return <span className="text-muted-foreground">Unassigned</span>;
  if (isLoading) return <span className="animate-pulse text-muted-foreground">Loading name…</span>;

  const user = usersData?.items?.find((u) => u.id === userId);

  if (user) {
    const u = user as Record<string, any>;
    const displayName =
      u.fullName ||
      u.displayName ||
      u.name ||
      [u.firstName, u.lastName].filter(Boolean).join(' ') ||
      u.email;

    return <span>{displayName || `User (${userId.slice(0, 8)}…)`}</span>;
  }

  return <span>User ({userId.slice(0, 8)}…)</span>;
}

function DocumentDownloadButton({ requestId, documentId }: { requestId: string; documentId: string }) {
  const { data, refetch, isFetching } = useDocumentDownloadUrl(requestId, documentId);

  async function handleDownload() {
    const res = await refetch();
    if (res.data?.url) {
      window.open(res.data.url, '_blank');
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={isFetching}>
      {isFetching ? 'Preparing…' : 'Download'}
    </Button>
  );
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;

  const { data: request, isLoading, error } = useRequest(requestId);
  const startWorkflow = useStartWorkflow();
  const { hasPermission } = usePermissions();

  // Modal State Controllers
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [assignStepId, setAssignStepId] = useState<string | null>(null);
  const [waivePaymentId, setWaivePaymentId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  if (!requestId) return null;
  if (isLoading) return <div className="p-6 text-muted-foreground animate-pulse">Loading request details…</div>;
  if (error || !request) return <div className="p-6 text-destructive font-semibold">Failed to load request details.</div>;

  const canAct = hasPermission ? hasPermission('request.act') : false;
  const canSettlePayment = hasPermission ? hasPermission('payment.settle') : false;
  // Re-routing somebody else's work is an administrator's call. Every reviewer
  // holds request.act, so gating the assign controls on it showed them to the
  // very people who should not be moving work between colleagues.
  const canAssign = hasPermission ? hasPermission('workflow.manage') : false;
  // Nothing about a finished request is still negotiable, priority least of all.
  const isClosed = ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.currentStatus);

  const steps = request.stepInstances || [];
  const documents = request.documents || [];
  const payments = request.payments || [];

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          {canAct && request.stage === 'READY_TO_START' && (
            <Button
              onClick={() => startWorkflow.mutateAsync(requestId)}
              disabled={startWorkflow.isPending}
            >
              {startWorkflow.isPending ? 'Starting Workflow…' : 'Start Workflow'}
            </Button>
          )}

          {canAct && !isClosed && (
            <>
              <Button variant="outline" onClick={() => setPriorityOpen(true)}>
                Change Priority
              </Button>
              <Dialog open={priorityOpen} onOpenChange={setPriorityOpen}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Update Request Priority</DialogTitle>
                  </DialogHeader>
                  <ChangePriorityForm
                    requestId={requestId}
                    currentPriority={request.priority as Priority}
                    onSuccess={() => setPriorityOpen(false)}
                    onCancel={() => setPriorityOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request #{request.referenceNo ?? request.id?.slice(0, 8)}</CardTitle>
            <Badge variant={request.stage === 'COMPLETED' ? 'secondary' : 'default'}>
              {request.stage || 'UNKNOWN'}
            </Badge>
          </div>
          <CardDescription>
            Priority: <span className="font-semibold">{request.priority}</span> | 
            SLA Risk: <span className="font-semibold">{request.slaRisk}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {request.rawText && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Citizen Description</h3>
              <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{request.rawText}</p>
            </div>
          )}

          {request.template && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Template</h3>
              <p className="text-sm font-semibold">
                {request.template.titleAr} {request.template.titleEn && `(${request.template.titleEn})`}
              </p>
            </div>
          )}

          {request.filledData && Object.keys(request.filledData).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Filled Data</h3>
              <div className="grid grid-cols-2 gap-2 bg-muted p-3 rounded-md text-sm">
                {Object.entries(request.filledData).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-medium text-muted-foreground">{key}:</span> {String(val)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Steps Section */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Progress and assigned actions for each step in this process.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workflow steps initiated yet.</p>
          ) : (
            steps.map((step: any) => {
              const isTerminal = ['DONE', 'REJECTED', 'SKIPPED'].includes(step.status);
              const showActButton = canAct && !isTerminal;

              return (
                <div key={step.id} className="border p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-(--ics-text)">
                        {step.stepName || `Workflow Step (${step.workflowStepId?.slice(0, 8)}…)`}
                      </p>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        Status: <span className="font-medium text-foreground">{step.status}</span>
                      </p>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        Assigned To:{' '}
                        <span className="font-medium text-foreground">
                          <AssigneeName userId={step.assignedToUserId} />
                        </span>
                      </p>
                    </div>
                    <Badge variant={step.status === 'DONE' ? 'secondary' : 'default'}>
                      {step.status}
                    </Badge>
                  </div>

                  {showActButton && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => setActiveStepId(step.id)}>
                        Act on Step
                      </Button>

                      {/* An unassigned step is the one an admin gets notified
                          about and, until now, could do nothing with. Admins
                          only: see canAssign. */}
                      {canAssign && (
                        <>
                          <Button
                            size="sm"
                            variant={step.assignedToUserId ? 'outline' : 'default'}
                            onClick={() => setAssignStepId(step.id)}
                          >
                            {step.assignedToUserId ? 'Reassign' : 'Assign to…'}
                          </Button>
                          <Dialog
                            open={assignStepId === step.id}
                            onOpenChange={(open) => setAssignStepId(open ? step.id : null)}
                          >
                            <DialogContent className="max-w-xl">
                              <AssignStepForm
                                requestId={requestId}
                                stepId={step.id}
                                stepName={step.stepName}
                                onSuccess={() => setAssignStepId(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      <Dialog
                        open={activeStepId === step.id}
                        onOpenChange={(open) => setActiveStepId(open ? step.id : null)}
                      >
                        <DialogContent className="max-w-xl">
                          <ActOnStepForm
                            requestId={requestId}
                            stepId={step.id}
                            stepName={step.stepName}
                            currentStepStatus={step.status}
                            allowedActionTypeIds={step.allowedActionTypeIds}
                            onSuccess={() => setActiveStepId(null)}
                            onClose={() => setActiveStepId(null)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Payments Section */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments & Fees</CardTitle>
            <CardDescription>Fees raised for steps in this workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Amount: {payment.amount} {payment.currency}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-semibold">{payment.status}</span>
                    {payment.requestedAt && ` \u00b7 raised ${new Date(payment.requestedAt).toLocaleString()}`}
                    {payment.settledAt && ` \u00b7 settled ${new Date(payment.settledAt).toLocaleString()}`}
                  </p>
                  {payment.requestStepInstanceId && (
                    <p className="text-xs text-muted-foreground">
                      Step:{' '}
                      {steps.find((s) => s.id === payment.requestStepInstanceId)?.stepName
                        ?? payment.requestStepInstanceId}
                    </p>
                  )}
                  {payment.waiverReason && (
                    <p className="text-xs text-muted-foreground">Waived: {payment.waiverReason}</p>
                  )}
                </div>
                {canSettlePayment && payment.status !== 'CONFIRMED' && payment.status !== 'WAIVED' && (
                  <div className="flex items-center gap-2">
                    <ConfirmPaymentButton requestId={requestId} paymentId={payment.id} />

                    <Button variant="outline" size="sm" onClick={() => setWaivePaymentId(payment.id)}>
                      Waive
                    </Button>
                    <Dialog
                      open={waivePaymentId === payment.id}
                      onOpenChange={(open) => setWaivePaymentId(open ? payment.id : null)}
                    >
                      <DialogContent className="max-w-xl">
                        <WaivePaymentForm
                          requestId={requestId}
                          paymentId={payment.id}
                          onSuccess={() => setWaivePaymentId(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Attachments from the requester, and anything produced while working
                the request.
              </CardDescription>
            </div>
            {/* The output of a step has to be able to reach the requester. A
                certificate that only exists on the clerk's desktop has not
                really been issued. Uploading it here puts it on the request,
                where the requester can download it. */}
            {canAct && (
              <>
                <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
                  Upload document
                </Button>
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogContent className="max-w-xl">
                    <UploadDocumentForm
                      requestId={requestId}
                      onSuccess={() => setUploadOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents attached.</p>
          ) : (
            documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium text-sm">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : 0} KB • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : ''}
                  </p>
                </div>
                <DocumentDownloadButton requestId={requestId} documentId={doc.id} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}