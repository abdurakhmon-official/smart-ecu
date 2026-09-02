'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { TwoFactorSetupOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useEnableTwoFactor, useSetupTwoFactor } from '@/hooks/use-two-factor';
import { errorFrom } from '@/lib/errors';

export function TwoFactorEnableFlow() {
  const t = useTranslations('admin.security');
  const setup = useSetupTwoFactor();
  const enable = useEnableTwoFactor();
  const [setupData, setSetupData] = useState<TwoFactorSetupOutput | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  if (backupCodes) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t('backupCodesIntro')}</p>
        <ul className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 font-mono text-sm">
          {backupCodes.map((backupCode) => (
            <li key={backupCode}>{backupCode}</li>
          ))}
        </ul>
        <Button onClick={() => setBackupCodes(null)} className="self-start">
          {t('done')}
        </Button>
      </div>
    );
  }

  if (!setupData) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Button
          onClick={async () => {
            setError(null);
            try {
              setSetupData(await setup.mutateAsync());
            } catch (err) {
              setError(errorFrom(err).message);
            }
          }}
          disabled={setup.isPending}
        >
          {t('startSetup')}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const result = await enable.mutateAsync({ code });
      setBackupCodes(result.backupCodes);
    } catch (err) {
      setError(errorFrom(err).message);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t('scanQr')}</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- base64 QR data URL, next/image is unnecessary here */}
      <img src={setupData.qrCodeDataUrl} alt={t('twoFactorTitle')} className="size-40 self-center rounded-md border border-border" />
      <p className="break-all rounded-md bg-muted p-2 text-center font-mono text-xs">{setupData.secret}</p>

      <FormField label={t('codeLabel')} htmlFor="enable-code" error={error ?? undefined}>
        <Input id="enable-code" autoFocus value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" />
      </FormField>

      <Button type="submit" disabled={enable.isPending || !code.trim()} className="self-start">
        {enable.isPending ? t('verifying') : t('confirmEnable')}
      </Button>
    </form>
  );
}
