'use client';
// src/components/forms/language-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateLanguage } from '@/lib/hooks/use-language';
import { CreateLanguageDto } from '@/types/catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LanguageForm() {
  const router = useRouter();
  const createLanguage = useCreateLanguage();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nativeName, setNativeName] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitError(null);

    if (!code.trim() || !name.trim() || !nativeName.trim()) {
      setSubmitError('Code, name, and native name are all required.');
      return;
    }

    const request: CreateLanguageDto = {
      code: code.trim(),
      name: name.trim(),
      nativeName: nativeName.trim(),
      isEnabled,
      isDefault,
    };

    try {
      await createLanguage.mutateAsync(request);
      router.push('/dashboard/languages');
    } catch {
      setSubmitError('Failed to create the language. Please check the values and try again.');
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>New Language</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="code">Code</Label>
          <Input id="code" placeholder="ar" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Arabic" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="nativeName">Native name</Label>
          <Input id="nativeName" placeholder="العربية" value={nativeName} onChange={(e) => setNativeName(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input id="isEnabled" type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
          <Label htmlFor="isEnabled">Enabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <input id="isDefault" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          <Label htmlFor="isDefault">Default language</Label>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={createLanguage.isPending}>
            {createLanguage.isPending ? 'Saving…' : 'Create Language'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/languages')}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}