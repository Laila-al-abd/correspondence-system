'use client';
// src/app/page.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center"
      style={{ backgroundColor: 'var(--ics-background)', color: 'var(--ics-text)' }}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          ICS Intelligent Correspondence System
        </h1>
        <h2 className="text-xl font-medium sm:text-2xl" dir="rtl">
          نظام ذكي لإدارة الطلبات في المؤسسات الجامعية
        </h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="min-w-40 text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--ics-primary)' }}
          onClick={() => router.push('/login')}
        >
          تسجيل دخول
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="min-w-40 hover:bg-(--ics-accent)/10"
          style={{ borderColor: 'var(--ics-accent)', color: 'var(--ics-accent)' }}
          onClick={() => router.push('/register')}
        >
          إنشاء حساب
        </Button>
      </div>
    </main>
  );
}