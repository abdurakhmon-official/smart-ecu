'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { useAdminReviews, useDeleteAdminReview } from '@/hooks/use-admin-reviews';

export function AdminReviewsView() {
  const t = useTranslations('admin.reviews');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data } = useAdminReviews({ page });
  const deleteReview = useDeleteAdminReview();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((review) => (
            <Card key={review.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">
                  {review.customerName} → {review.serviceProviderName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('rating')}: {review.rating}/5
                </p>
                {review.comment && <p className="mt-1 text-sm">{review.comment}</p>}
              </div>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeletingId(review.id)}>
                {t('delete')}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}

      <Dialog open={Boolean(deletingId)} onOpenChange={(next) => !next && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('deleteConfirmDescription')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              {t('cancel')}
            </Button>
            <Button
              className="bg-destructive text-white hover:opacity-90"
              disabled={deleteReview.isPending}
              onClick={() => {
                if (!deletingId) return;
                deleteReview.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
              }}
            >
              {t('confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
