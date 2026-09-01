'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { OrderCard } from '@/components/orders/OrderCard';
import { ReviewDialog } from '@/components/orders/ReviewDialog';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/use-auth';
import { useMyOrders } from '@/hooks/use-my-orders';
import { Link } from '@/i18n/navigation';

export function MyOrdersView() {
  const t = useTranslations('orders');
  const tNav = useTranslations('nav');
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const { data } = useMyOrders({}, isAuthenticated);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);

  if (!sessionLoading && !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">{t('signInToOrder')}</p>
        <Link href="/sign-in">
          <Button>{tNav('signIn')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((order) => (
            <OrderCard key={order.id} order={order} onReview={setReviewingOrderId} />
          ))}
        </div>
      )}

      <ReviewDialog orderId={reviewingOrderId} onClose={() => setReviewingOrderId(null)} />
    </div>
  );
}
