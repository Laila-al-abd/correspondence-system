'use client';
// src/components/forms/register-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '@/lib/hooks/use-auth';
import { RegisterUserDto, ApplicantPurpose } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const selectClass =
  'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base';

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();

  const [fullNameAr, setFullNameAr] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [applicantPurpose, setApplicantPurpose] = useState<ApplicantPurpose | ''>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Presentation-only: toggles the input's type attribute. Does not touch
  // the password value, validation, or submission logic below.
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    setSubmitError(null);

    if (!fullNameAr.trim() || !email.trim() || password.length < 8) {
      setSubmitError('Arabic name, email, and an 8+ character password are required.');
      return;
    }

    const request: RegisterUserDto = {
      fullNameAr,
      fullNameEn: fullNameEn || undefined,
      email,
      phone: phone || undefined,
      password,
      applicantPurpose: applicantPurpose || undefined,
    };

    try {
      const result = await register.mutateAsync(request);
      // Backend always returns this fixed message whether or not the email
      // already existed — never assume success means a new account was made.
      setSuccessMessage(result.message);
    } catch {
      setSubmitError('Registration failed. Please check your details and try again.');
    }
  }

  if (successMessage) {
    return (
      <Card
        className="w-full max-w-md border-2 shadow-lg"
        style={{ borderColor: 'color-mix(in srgb, var(--ics-primary) 25%, transparent)' }}
      >
        <CardContent className="pt-8 space-y-5 text-center">
          <p className="text-base" style={{ color: 'var(--ics-text)' }}>
            {successMessage}
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="h-12 text-base text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--ics-primary)' }}
          >
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full max-w-md border-2 shadow-lg"
      style={{ borderColor: 'color-mix(in srgb, var(--ics-primary) 25%, transparent)' }}
    >
      <CardHeader className="space-y-2 pb-2">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--ics-accent)' }}
        >
          ICS
        </p>
        <CardTitle
          className="text-3xl font-semibold"
          style={{ color: 'var(--ics-primary)' }}
        >
          Welcome to ICS
        </CardTitle>
        <p className="text-sm" style={{ color: 'var(--ics-text)', opacity: 0.65 }}>
          Create an account to submit and track your requests.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="space-y-2">
          <Label htmlFor="fullNameAr" className="text-sm font-medium">
            Full name (Arabic)
          </Label>
          <Input
            id="fullNameAr"
            value={fullNameAr}
            onChange={(e) => setFullNameAr(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullNameEn" className="text-sm font-medium">
            Full name (English)
          </Label>
          <Input
            id="fullNameEn"
            value={fullNameEn}
            onChange={(e) => setFullNameEn(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <Eye className="h-5 w-5" style={{ color: 'var(--ics-text)' }} />
              ) : (
                <EyeOff className="h-5 w-5" style={{ color: 'var(--ics-text)' }} />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="applicantPurpose" className="text-sm font-medium">
            Purpose
          </Label>
          <select
            id="applicantPurpose"
            className={selectClass}
            value={applicantPurpose}
            onChange={(e) => setApplicantPurpose(e.target.value as ApplicantPurpose | '')}
          >
            <option value="">— select —</option>
            {Object.values(ApplicantPurpose).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <Button
          onClick={handleSubmit}
          disabled={register.isPending}
          className="w-full h-12 text-base text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--ics-primary)' }}
        >
          {register.isPending ? 'Submitting…' : 'Register'}
        </Button>
      </CardContent>
    </Card>
  );
}