'use client';

// src/app/dashboard/requests/[id]/edit/page.tsx

import { useParams, useRouter } from 'next/navigation';
import { useRequest } from '@/lib/hooks/use-requests';
import { ConfirmRequestForm } from '@/components/forms/confirm-request-form';
import { Button } from '@/components/ui/button';

export default function EditRequestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: request, isLoading } = useRequest(params.id);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!request) return <p className="p-6 text-destructive">Request not found.</p>;

  if (request.stage !== 'AWAITING_CONFIRMATION') {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">This request can't be edited right now.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/requests')}>
          Back to My Requests
        </Button>
      </div>
    );
  }

  // This explicit check narrows the type. 
  // TypeScript now knows `request.template` is definitely NOT undefined below this line.
  if (!request.template) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-destructive">Error: Form template is missing.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/requests')}>
          Back to My Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ConfirmRequestForm
        requestId={request.id}
        template={request.template} 
        filledData={request.filledData ?? {}}
        missingRequiredFields={request.missingRequiredFields ?? []}
      />
    </div>
  );
}