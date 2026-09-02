'use client';

import { useTranslations } from 'next-intl';
import { SubscriptionSummary } from '@/components/account/SubscriptionSummary';
import { TelegramLinkPanel } from '@/components/account/TelegramLinkPanel';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { Link } from '@/i18n/navigation';

export function AccountView() {
  const t = useTranslations('account');
  const { isAuthenticated, loading } = useSession();

  if (!loading && !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
        <Link href="/sign-in">
          <Button>{t('signIn')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionSummary />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('telegram.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TelegramLinkPanel />
        </CardContent>
      </Card>
    </div>
  );
}
