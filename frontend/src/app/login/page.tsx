// src/app/login/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--ics-background)', color: 'var(--ics-text)' }}
    >
      <Link
        href="/"
        className="absolute top-6 right-6 flex items-center gap-1.5 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--ics-primary)' }}
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <LoginForm />
    </main>
  );
}