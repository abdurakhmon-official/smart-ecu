'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAdminStats } from '@/hooks/use-admin-stats';

export function AdminStatsView() {
  const t = useTranslations('admin.stats');
  const { data } = useAdminStats();

  if (!data) return null;

  const cards = [
    { label: t('users'), value: data.users.total },
    { label: t('serviceProviders'), value: data.serviceProviders.total },
    { label: t('serviceProvidersPending'), value: data.serviceProviders.pending },
    { label: t('orders'), value: data.orders.total },
    { label: t('ordersNew'), value: data.orders.new },
    { label: t('vehicles'), value: data.vehicles },
    { label: t('reviews'), value: data.reviews.total },
    { label: t('avgRating'), value: data.reviews.avgRating.toFixed(1) },
    { label: t('aiConversations'), value: data.aiConversations },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{card.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('usersByRole')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <span>{t('customers')}: {data.users.customers}</span>
          <span>{t('services')}: {data.users.services}</span>
          <span>{t('tuners')}: {data.users.tuners}</span>
          <span>{t('admins')}: {data.users.admins}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('ordersByStatus')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <span>{t('ordersNew')}: {data.orders.new}</span>
          <span>{t('ordersInProgress')}: {data.orders.inProgress}</span>
          <span>{t('ordersCompleted')}: {data.orders.completed}</span>
          <span>{t('ordersCancelled')}: {data.orders.cancelled}</span>
        </CardContent>
      </Card>
    </div>
  );
}
