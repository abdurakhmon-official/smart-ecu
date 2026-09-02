'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/use-auth';
import { useCreateTelegramLinkCode, useUnlinkTelegram } from '@/hooks/use-telegram';

export function TelegramLinkPanel() {
  const t = useTranslations('account.telegram');
  const { user } = useSession();
  const createLinkCode = useCreateTelegramLinkCode();
  const unlink = useUnlinkTelegram();
  const [deepLink, setDeepLink] = useState<string | null>(null);

  if (user?.telegramLinked) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('linked')}</p>
        <Button variant="outline" className="text-destructive" onClick={() => unlink.mutate()} disabled={unlink.isPending}>
          {t('unlink')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t('notLinked')}</p>

      {deepLink ? (
        <a href={deepLink} target="_blank" rel="noreferrer">
          <Button>{t('openBot')}</Button>
        </a>
      ) : (
        <Button
          onClick={async () => {
            const result = await createLinkCode.mutateAsync();
            setDeepLink(result.deepLink);
          }}
          disabled={createLinkCode.isPending}
        >
          {t('generateCode')}
        </Button>
      )}
    </div>
  );
}
