'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMySubscription } from '@/hooks/use-subscription';
import { Link } from '@/i18n/navigation';

export function SubscriptionSummary() {
  const t = useTranslations('account.subscription');
  const { data: subscription } = useMySubscription();

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">{t('currentPlan')}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge>{subscription?.plan ?? 'FREE'}</Badge>
          {subscription?.currentPeriodEnd && (
            <span className="text-xs text-muted-foreground">
              {t('until')} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <Link href="/pricing">
        <Button size="sm" variant="outline">
          {t('managePlan')}
        </Button>
      </Link>
    </div>
  );
}
