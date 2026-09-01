'use client';

import { useTranslations } from 'next-intl';
import type { OrderOutput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useCancelOrder } from '@/hooks/use-my-orders';
import { pickLocalized } from '@/lib/localized';

const STATUS_BADGE_VARIANT = { NEW: 'default', IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'danger' } as const;

// interfaces

interface OrderCardProps {
  order: OrderOutput;
  onReview: (orderId: string) => void;
}

export function OrderCard({ order, onReview }: OrderCardProps) {
  const t = useTranslations('orders');
  const locale = useAppLocale();
  const cancelOrder = useCancelOrder();

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{pickLocalized(order.serviceCatalogItem.name, locale)}</p>
          <p className="text-sm text-muted-foreground">{order.city}</p>
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{t(`status.${order.status}`)}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{order.problemDescription}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {order.status === 'NEW' && (
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => cancelOrder.mutate(order.id)}>
            {t('cancelOrder')}
          </Button>
        )}
        {order.status === 'COMPLETED' && !order.hasReview && (
          <Button size="sm" onClick={() => onReview(order.id)}>
            {t('leaveReview')}
          </Button>
        )}
      </div>
    </Card>
  );
}
