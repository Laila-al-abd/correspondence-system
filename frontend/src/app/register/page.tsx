// // src/app/register/page.tsx
// import Link from 'next/link';
// import { ArrowLeft } from 'lucide-react';
// import { RegisterForm } from '@/components/forms/register-form';

// export default function RegisterPage() {
//   return (
//     <main
//       className="relative flex min-h-screen items-center justify-center px-4 py-12"
//       style={{ backgroundColor: 'var(--ics-background)', color: 'var(--ics-text)' }}
//     >
//       <Link
//         href="/"
//         className="absolute top-6 right-6 flex items-center gap-1.5 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
//         style={{ color: 'var(--ics-primary)' }}
//         aria-label="Back to home"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Back
//       </Link>
//       <RegisterForm />
//     </main>
//   );
// }
'use client';
// src/app/page.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--ics-background)] text-[var(--ics-text)]">
      {/* Elegant Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-[var(--ics-secondary)] opacity-[0.15] blur-[100px]" />
        <div className="absolute top-[30%] -right-[15%] h-[70%] w-[60%] rounded-full bg-[var(--ics-primary)] opacity-[0.12] blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[10%] h-[50%] w-[70%] rounded-full bg-[var(--ics-accent)] opacity-[0.15] blur-[100px]" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
        
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-[var(--ics-primary)]/10 ring-1 ring-black/5"
        >
          <Mail className="h-10 w-10 text-[var(--ics-primary)]" strokeWidth={1.5} />
        </motion.div>

        {/* Headlines */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl space-y-6"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            ICS Intelligent <br className="hidden sm:block" />
            <span className="bg-gradient-to-br from-[var(--ics-primary)] to-[var(--ics-accent)] bg-clip-text text-transparent">
              Correspondence System
            </span>
          </h1>
          <h2 className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-[var(--ics-text)]/70 sm:text-xl md:text-2xl" dir="rtl">
            نظام ذكي لإدارة الطلبات في المؤسسات الجامعية
          </h2>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 flex flex-col items-center gap-4 w-full sm:w-auto sm:flex-row sm:gap-6"
        >
          <Button
            size="lg"
            className="group relative h-14 w-full sm:w-48 overflow-hidden rounded-full bg-[var(--ics-primary)] text-base text-white shadow-md shadow-[var(--ics-primary)]/20 transition-all hover:bg-[var(--ics-primary)]/90 hover:shadow-xl hover:shadow-[var(--ics-primary)]/30 hover:-translate-y-0.5"
            onClick={() => router.push('/login')}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-wide">
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-full sm:w-48 rounded-full border-2 border-[var(--ics-accent)]/30 bg-white/50 text-base font-semibold text-[var(--ics-primary)] backdrop-blur-md transition-all hover:border-[var(--ics-accent)] hover:bg-[var(--ics-accent)]/5 hover:-translate-y-0.5"
            onClick={() => router.push('/register')}
          >
            Register
          </Button>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-6 sm:gap-10 text-sm font-medium text-[var(--ics-text)]/60"
        >
          <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full ring-1 ring-black/5 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-[var(--ics-accent)]" />
            <span>Secure Access</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full ring-1 ring-black/5 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-[var(--ics-accent)]" />
            <span>Fast Processing</span>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
