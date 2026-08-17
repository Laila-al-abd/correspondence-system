// // src/app/login/page.tsx
// import Link from 'next/link';
// import { ArrowLeft } from 'lucide-react';
// import { LoginForm } from '@/components/forms/login-form';

// export default function LoginPage() {
//   return (
//     <main
//       className="relative flex min-h-screen items-center justify-center px-4"
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
//       <LoginForm />
//     </main>
//   );
// }

'use client';
// src/app/login/page.tsx
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--ics-background) px-4 text-(--ics-text)">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-(--ics-primary) opacity-[0.12] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-15%] h-[60%] w-[50%] rounded-full bg-(--ics-accent) opacity-[0.1] blur-[120px]" />
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-6 right-6 z-20"
      >
        <Link
          href="/"
          className="group flex items-center gap-1.5 text-sm font-medium text-(--ics-primary) opacity-70 transition-all hover:opacity-100"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <LoginForm />
      </motion.div>
    </main>
  );
}
