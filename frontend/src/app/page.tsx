// 'use client';
// // src/app/page.tsx
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';

// export default function HomePage() {
//   const router = useRouter();

//   return (
//     <main
//       className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center"
//       style={{ backgroundColor: 'var(--ics-background)', color: 'var(--ics-text)' }}
//     >
//       <div className="space-y-2">
//         <h1 className="text-2xl font-semibold sm:text-3xl">
//           ICS Intelligent Correspondence System
//         </h1>
//         <h2 className="text-xl font-medium sm:text-2xl" dir="rtl">
//           نظام ذكي لإدارة الطلبات في المؤسسات الجامعية
//         </h2>
//       </div>

//       <div className="flex flex-col gap-3 sm:flex-row">
//         <Button
//           size="lg"
//           className="min-w-40 text-white hover:opacity-90"
//           style={{ backgroundColor: 'var(--ics-primary)' }}
//           onClick={() => router.push('/login')}
//         >
//          sign in
//         </Button>
//         <Button
//           size="lg"
//           variant="outline"
//           className="min-w-40 hover:bg-(--ics-accent)/10"
//           style={{ borderColor: 'var(--ics-accent)', color: 'var(--ics-accent)' }}
//           onClick={() => router.push('/register')}
//         >
//          register
//         </Button>
//       </div>
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-(--ics-background) text-(--ics-text)">
      {/* Elegant Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-(--ics-secondary) opacity-[0.15] blur-[100px]" />
        <div className="absolute top-[30%] right-[-15%] h-[70%] w-[60%] rounded-full bg-(--ics-primary) opacity-[0.12] blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[10%] h-[50%] w-[70%] rounded-full bg-(--ics-accent) opacity-[0.15] blur-[100px]" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
        
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-(--ics-primary)/10 ring-1 ring-black/5"
        >
          <Mail className="h-10 w-10 text-(--ics-primary)" strokeWidth={1.5} />
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
            <span className="bg-linear-to-br from-(--ics-primary) to-(--ics-accent) bg-clip-text text-transparent">
              Correspondence System
            </span>
          </h1>
          <h2 className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-(--ics-text)/70 sm:text-xl md:text-2xl" dir="rtl">
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
            className="group relative h-14 w-full sm:w-48 overflow-hidden rounded-full bg-(--ics-primary) text-base text-white shadow-md shadow-(--ics-primary)/20 transition-all hover:bg-(--ics-primary)/90 hover:shadow-xl hover:shadow-(--ics-primary)/30 hover:-translate-y-0.5"
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
            className="h-14 w-full sm:w-48 rounded-full border-2 border-(--ics-accent)/30 bg-white/50 text-base font-semibold text-(--ics-primary) backdrop-blur-md transition-all hover:border-(--ics-accent) hover:bg-(--ics-accent)/5 hover:-translate-y-0.5"
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
          className="mt-10 flex items-center justify-center gap-6 sm:gap-10 text-sm font-medium text-(--ics-text)/60"
        >
          <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full ring-1 ring-black/5 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-(--ics-accent)" />
            <span>Secure Access</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full ring-1 ring-black/5 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-(--ics-accent)" />
            <span>Fast Processing</span>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
