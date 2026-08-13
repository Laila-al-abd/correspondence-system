// src/app/not-found.tsx
//
// Without this file Next serves its own built-in 404, which on a dark theme is
// an unexplained black screen -- indistinguishable from a crash, and exactly
// what a stale dev route manifest looks like from the outside. This says which
// URL failed, so the next occurrence is diagnosable in one glance.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        Nothing is routed at this address.
      </p>
      <code className="rounded-md bg-muted px-3 py-1.5 text-sm">{pathname}</code>
      <p className="text-xs text-muted-foreground max-w-md">
        If this address looks correct and the page file exists, the dev server
        is serving a stale route manifest: stop it, delete the .next folder, and
        start it again.
      </p>
      <Link href="/dashboard" className="underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
