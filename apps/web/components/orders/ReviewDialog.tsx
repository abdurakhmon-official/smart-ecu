'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Textarea';
import { useReviewOrder } from '@/hooks/use-my-orders';
import { cn } from '@/lib/utils';
import { errorFrom } from '@/lib/errors';

// interfaces

interface ReviewDialogProps {
  orderId: string | null;
  onClose: () => void;
}

export function ReviewDialog({ orderId, onClose }: ReviewDialogProps) {
  const t = useTranslations('orders');
  const reviewOrder = useReviewOrder();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    onClose();
    setRating(5);
    setComment('');
    setError(null);
  };

  const onSubmit = async () => {
    if (!orderId) return;
    setError(null);

    try {
      await reviewOrder.mutateAsync({ orderId, input: { rating, comment: comment || undefined } });
      close();
    } catch (submitError) {
      setError(errorFrom(submitError).message);
    }
  };

  return (
    <Dialog open={Boolean(orderId)} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('reviewTitle')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormField label={t('rating')} htmlFor="review-rating">
            <div className="flex gap-1" id="review-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} aria-label={String(value)}>
                  <Star className={cn('size-6', value <= rating ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                </button>
              ))}
            </div>
          </FormField>

          <FormField label={t('comment')} htmlFor="review-comment">
            <Textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} />
          </FormField>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            {t('cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={reviewOrder.isPending}>
            {t('submitReview')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
