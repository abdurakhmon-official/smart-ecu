'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useVerifyTwoFactor } from '@/hooks/use-auth';
import { errorFrom } from '@/lib/errors';

// interfaces

interface TwoFactorStepProps {
  mfaToken: string;
  onSuccess: () => void;
}

export function TwoFactorStep({ mfaToken, onSuccess }: TwoFactorStepProps) {
  const t = useTranslations('auth');
  const verifyTwoFactor = useVerifyTwoFactor();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const result = await verifyTwoFactor.mutateAsync({ mfaToken, code });
      if (!result.mfaRequired) onSuccess();
    } catch (err) {
      setError(errorFrom(err).message);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('twoFactor.title')}</CardTitle>
        <CardDescription>{t('twoFactor.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <FormField label={t('twoFactor.codeLabel')} htmlFor="mfa-code" error={error ?? undefined}>
            <Input
              id="mfa-code"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t('twoFactor.codePlaceholder')}
            />
          </FormField>

          <Button type="submit" disabled={verifyTwoFactor.isPending || !code.trim()} className="mt-2">
            {verifyTwoFactor.isPending ? t('twoFactor.verifying') : t('twoFactor.verify')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
