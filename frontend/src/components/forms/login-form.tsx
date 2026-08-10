'use client';
// src/components/forms/login-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/lib/hooks/use-auth';
import { LoginDto } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Presentation-only: toggles the input's type attribute. Does not touch
  // the password value, validation, or submission logic below.
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    setSubmitError(null);

    if (!email.trim() || !password) {
      setSubmitError('Email and password are required.');
      return;
    }

    const request: LoginDto = { email, password };

    try {
      // identityApi.login already persists the token to the auth_token cookie.
      await login.mutateAsync(request);
      router.push('/dashboard');
    } catch {
      setSubmitError('Invalid email or password.');
    }
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
          Welcome again
        </CardTitle>
        <p className="text-sm" style={{ color: 'var(--ics-text)', opacity: 0.65 }}>
          Sign in to continue to your requests.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
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

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <Button
          onClick={handleSubmit}
          disabled={login.isPending}
          className="w-full h-12 text-base text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--ics-primary)' }}
        >
          {login.isPending ? 'Signing in…' : 'Sign In'}
        </Button>
      </CardContent>
    </Card>
  );
}