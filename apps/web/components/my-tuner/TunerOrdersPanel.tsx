'use client';

import { useTranslations } from 'next-intl';
import { TuningOrderCard } from '@/components/my-tuner/TuningOrderCard';
import { useTunerOrders } from '@/hooks/use-tuner-orders';

export function TunerOrdersPanel() {
  const t = useTranslations('myTuner.orders');
  const { data } = useTunerOrders();

  if (!data?.data.length) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.data.map((order) => (
        <TuningOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
