// src/app/register/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/components/forms/register-form';

export default function RegisterPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4 py-12"
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
      <RegisterForm />
    </main>
  );
}