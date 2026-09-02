'use client';

import { useTranslations } from 'next-intl';
import { ApplyTunerForm } from '@/components/my-tuner/ApplyTunerForm';
import { TunerBrandsPanel } from '@/components/my-tuner/TunerBrandsPanel';
import { TunerOrdersPanel } from '@/components/my-tuner/TunerOrdersPanel';
import { TunerProfileForm } from '@/components/my-tuner/TunerProfileForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useSession } from '@/hooks/use-auth';
import { useMyTuner } from '@/hooks/use-my-tuner';
import { Link } from '@/i18n/navigation';

const STATUS_BADGE_VARIANT = { PENDING: 'warning', VERIFIED: 'success', SUSPENDED: 'danger' } as const;

export function MyTunerView() {
  const t = useTranslations('myTuner');
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const { data: tuner, isPending } = useMyTuner(isAuthenticated);

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

  if (!tuner) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        <ApplyTunerForm />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Badge variant={STATUS_BADGE_VARIANT[tuner.status]}>{t(`status.${tuner.status}`)}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{t(`statusNote.${tuner.status}`)}</p>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="brands">{t('tabs.brands')}</TabsTrigger>
          <TabsTrigger value="orders">{t('tabs.orders')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <TunerProfileForm tuner={tuner} />
        </TabsContent>
        <TabsContent value="brands">
          <TunerBrandsPanel selected={tuner.brands} />
        </TabsContent>
        <TabsContent value="orders">
          <TunerOrdersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
