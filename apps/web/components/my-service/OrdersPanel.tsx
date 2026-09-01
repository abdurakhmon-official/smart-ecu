'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAcceptOrder, useCompleteOrder, useServiceOrders } from '@/hooks/use-service-orders';
import { pickLocalized } from '@/lib/localized';

const STATUS_BADGE_VARIANT = { NEW: 'default', IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'danger' } as const;

// interfaces

interface OrdersPanelProps {
  myServiceProviderId: string;
}

export function OrdersPanel({ myServiceProviderId }: OrdersPanelProps) {
  const t = useTranslations('myService.inbox');
  const tOrders = useTranslations('orders');
  const locale = useAppLocale();
  const { data } = useServiceOrders();
  const acceptOrder = useAcceptOrder();
  const completeOrder = useCompleteOrder();

  if (!data?.data.length) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.data.map((order) => {
        const takenByOther = order.status !== 'NEW' && order.acceptedServiceProviderId !== myServiceProviderId;
        const mine = order.acceptedServiceProviderId === myServiceProviderId;

        return (
          <Card key={order.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{pickLocalized(order.serviceCatalogItem.name, locale)}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customerName} · {order.city} · {order.phone}
                </p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{tOrders(`status.${order.status}`)}</Badge>
            </div>

            <p className="text-sm text-muted-foreground">{order.problemDescription}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {order.status === 'NEW' && (
                <Button size="sm" onClick={() => acceptOrder.mutate(order.id)} disabled={acceptOrder.isPending}>
                  {t('accept')}
                </Button>
              )}
              {order.status === 'IN_PROGRESS' && mine && (
                <Button size="sm" onClick={() => completeOrder.mutate(order.id)} disabled={completeOrder.isPending}>
                  {t('complete')}
                </Button>
              )}
              {order.status === 'IN_PROGRESS' && mine && <span className="text-xs text-muted-foreground">{t('acceptedByYou')}</span>}
              {takenByOther && <span className="text-xs text-muted-foreground">{t('takenByOther')}</span>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
