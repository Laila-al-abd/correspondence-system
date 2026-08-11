'use client';
//frontend\src\app\dashboard\requests\queue\hitl\[id]\page.tsx
import { useParams, useRouter } from 'next/navigation';
import { useRequest } from '@/lib/hooks/use-requests';
import { PermissionGate } from '@/components/permission-gate';
import { ClassifyByHumanForm } from '@/components/forms/classify-by-human-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function HitlClassifyContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: request, isLoading, isError } = useRequest(params.id);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (isError || !request) return <p className="p-6 text-destructive">Request not found.</p>;

  if (!['IN_HUMAN_REVIEW', 'AWAITING_CLASSIFICATION'].includes(request.stage)) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">
          This request is no longer waiting for classification — someone else may have already
          resolved it.
        </p>
        <Button variant="outline" onClick={() => router.push('/dashboard/requests/queue/hitl')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Request {request.referenceNo ?? request.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{request.rawText}</p>
        </CardContent>
      </Card>

      <ClassifyByHumanForm requestId={request.id} />
    </div>
  );
}

export default function HitlClassifyPage() {
  return (
    <PermissionGate require="request.classify">
      <HitlClassifyContent />
    </PermissionGate>
  );
}