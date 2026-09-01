'use client';

import { Clock, MapPin, MessageCircle, Phone, Send, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useServiceProvider } from '@/hooks/use-service-providers';
import { useProviderReviews } from '@/hooks/use-reviews';
import { useAppLocale } from '@/hooks/use-app-locale';
import { Link } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/localized';

// interfaces

interface ServiceProfileViewProps {
  id: string;
}

export function ServiceProfileView({ id }: ServiceProfileViewProps) {
  const t = useTranslations('serviceProfile');
  const tOrders = useTranslations('orders');
  const locale = useAppLocale();
  const { data: provider, isPending } = useServiceProvider(id);
  const { data: reviews } = useProviderReviews(id);

  if (isPending || !provider) {
    return <div className="mx-auto w-full max-w-3xl px-4 py-12" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t('back')}
      </Link>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{provider.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {provider.city}
              {provider.address && ` · ${provider.address}`}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-lg font-semibold">
            <Star className="size-5 fill-primary text-primary" />
            {provider.ratingAvg.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">({provider.ratingCount})</span>
          </div>
        </div>

        {provider.description && <p className="text-sm text-muted-foreground">{provider.description}</p>}

        {provider.workingHours && (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            {provider.workingHours}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <a href={`tel:${provider.phone}`}>
            <Button size="sm">
              <Phone className="size-4" />
              {t('call')}
            </Button>
          </a>
          {provider.telegram && (
            <a href={`https://t.me/${provider.telegram.replace(/^@/, '')}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <Send className="size-4" />
                Telegram
              </Button>
            </a>
          )}
          {provider.whatsapp && (
            <a href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </a>
          )}
          <CreateOrderDialog
            defaultCity={provider.city}
            trigger={<Button size="sm" variant="outline">{tOrders('createTitle')}</Button>}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="font-semibold">{t('offerings')}</h2>
        {!provider.offerings.length ? (
          <p className="text-sm text-muted-foreground">{t('noOfferings')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {provider.offerings.map((offering) => (
              <div key={offering.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                <span>{pickLocalized(offering.serviceCatalogItem.name, locale)}</span>
                {(offering.priceMin || offering.priceMax) && (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {offering.priceMin && offering.priceMax
                      ? t('priceRange', { min: offering.priceMin.toLocaleString(), max: offering.priceMax.toLocaleString() })
                      : t('priceFrom', { price: (offering.priceMin ?? offering.priceMax ?? 0).toLocaleString() })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="font-semibold">{t('brands')}</h2>
        {!provider.brands.length ? (
          <p className="text-sm text-muted-foreground">{t('noBrands')}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {provider.brands.map((brand) => (
              <Badge key={brand.id}>{brand.name}</Badge>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="font-semibold">{t('reviewsTitle')}</h2>
        {!reviews?.data.length ? (
          <p className="text-sm text-muted-foreground">{t('noReviews')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.data.map((review) => (
              <div key={review.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.customerName}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-primary text-primary" />
                    {review.rating}
                  </div>
                </div>
                {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
