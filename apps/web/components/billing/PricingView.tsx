'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { PaymentProvider, SubscriptionPlan } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { useCheckout, useMySubscription, useSubscriptionPlans } from '@/hooks/use-subscription';
import { Link } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';

const PROVIDERS: PaymentProvider[] = ['PAYME', 'CLICK'];

/** Alohida top-level funksiya — checkout tashqi domenga (Payme/Click) yo'naltiradi, ichki Next.js marshrut emas. */
const redirectToCheckout = (url: string): void => {
  window.location.href = url;
};

export function PricingView() {
  const t = useTranslations('pricing');
  const { isAuthenticated } = useSession();
  const { data: plans } = useSubscriptionPlans();
  const { data: mySubscription } = useMySubscription(isAuthenticated);
  const checkout = useCheckout();
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);

  const subscribe = async (plan: SubscriptionPlan, provider: PaymentProvider) => {
    if (plan === 'FREE') return;

    setError(null);
    setPendingPlan(plan);

    try {
      const result = await checkout.mutateAsync({ plan, provider });
      redirectToCheckout(result.checkoutUrl);
    } catch (err) {
      setError(errorFrom(err).message);
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans?.map((info) => {
          const isCurrent = mySubscription?.plan === info.plan;

          return (
            <Card key={info.plan} className={isCurrent ? 'border-primary' : undefined}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t(`plans.${info.plan}`)}
                  {isCurrent && <Badge variant="success">{t('current')}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-2xl font-bold">
                  {info.priceSom === 0 ? t('free') : `${info.priceSom.toLocaleString()} ${t('somPerMonth')}`}
                </p>

                {info.plan !== 'FREE' && !isCurrent && (
                  <>
                    {!isAuthenticated ? (
                      <Link href="/sign-in">
                        <Button className="w-full">{t('signInToSubscribe')}</Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {PROVIDERS.map((provider) => (
                          <Button
                            key={provider}
                            variant="outline"
                            disabled={checkout.isPending && pendingPlan === info.plan}
                            onClick={() => subscribe(info.plan, provider)}
                          >
                            {t('payWith', { provider })}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
