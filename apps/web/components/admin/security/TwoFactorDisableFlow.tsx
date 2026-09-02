'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useDisableTwoFactor } from '@/hooks/use-two-factor';
import { errorFrom } from '@/lib/errors';

export function TwoFactorDisableFlow() {
  const t = useTranslations('admin.security');
  const disable = useDisableTwoFactor();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
        {t('startDisable')}
      </Button>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await disable.mutateAsync({ code });
      setConfirming(false);
    } catch (err) {
      setError(errorFrom(err).message);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField label={t('codeLabel')} htmlFor="disable-code" error={error ?? undefined}>
        <Input id="disable-code" autoFocus value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" />
      </FormField>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
          {t('cancel')}
        </Button>
        <Button type="submit" className="bg-destructive text-white hover:opacity-90" disabled={disable.isPending || !code.trim()}>
          {disable.isPending ? t('verifying') : t('confirmDisable')}
        </Button>
      </div>
    </form>
  );
}
