'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { OrderStatus } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useAppLocale } from '@/hooks/use-app-locale';
import { pickLocalized } from '@/lib/localized';

const STATUSES: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_BADGE_VARIANT = { NEW: 'default', IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'danger' } as const;

export function AdminOrdersView() {
  const t = useTranslations('admin.orders');
  const tOrders = useTranslations('orders');
  const locale = useAppLocale();
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useAdminOrders({ status: status || undefined, city: city || undefined, page });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('filterCity')}
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as OrderStatus | '');
            setPage(1);
          }}
          className="max-w-48"
        >
          <option value="">{t('allStatuses')}</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {tOrders(`status.${item}`)}
            </option>
          ))}
        </Select>
      </div>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((order) => (
            <Card key={order.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">{pickLocalized(order.serviceCatalogItem.name, locale)}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {order.customerName} · {order.city} · {order.phone}
                </p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{tOrders(`status.${order.status}`)}</Badge>
            </Card>
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}
