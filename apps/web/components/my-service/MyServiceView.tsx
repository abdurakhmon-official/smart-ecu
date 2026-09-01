'use client';

import { useTranslations } from 'next-intl';
import { ApplyForm } from '@/components/my-service/ApplyForm';
import { BrandsPanel } from '@/components/my-service/BrandsPanel';
import { OfferingsPanel } from '@/components/my-service/OfferingsPanel';
import { OrdersPanel } from '@/components/my-service/OrdersPanel';
import { ProfileForm } from '@/components/my-service/ProfileForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useSession } from '@/hooks/use-auth';
import { useMyService } from '@/hooks/use-my-service';
import { Link } from '@/i18n/navigation';

const STATUS_BADGE_VARIANT = { PENDING: 'warning', VERIFIED: 'success', SUSPENDED: 'danger' } as const;

export function MyServiceView() {
  const t = useTranslations('myService');
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const { data: provider, isPending } = useMyService(isAuthenticated);

  if (!sessionLoading && !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
        <Link href="/sign-in">
          <Button>{t('signIn')}</Button>
        </Link>
      </div>
    );
  }

  if (isPending) {
    return <div className="mx-auto w-full max-w-3xl px-4 py-12" />;
  }

  if (!provider) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        <ApplyForm />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Badge variant={STATUS_BADGE_VARIANT[provider.status]}>{t(`status.${provider.status}`)}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{t(`statusNote.${provider.status}`)}</p>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="offerings">{t('tabs.offerings')}</TabsTrigger>
          <TabsTrigger value="brands">{t('tabs.brands')}</TabsTrigger>
          <TabsTrigger value="orders">{t('tabs.orders')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm provider={provider} />
        </TabsContent>
        <TabsContent value="offerings">
          <OfferingsPanel offerings={provider.offerings} />
        </TabsContent>
        <TabsContent value="brands">
          <BrandsPanel selected={provider.brands} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersPanel myServiceProviderId={provider.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
