'use client';

import { MapPin, Phone, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ServiceProviderOutput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppLocale } from '@/hooks/use-app-locale';
import { Link } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/localized';

// interfaces

interface ServiceProviderCardProps {
  provider: ServiceProviderOutput;
}

export function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const t = useTranslations('services');
  const locale = useAppLocale();

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{provider.name}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{provider.city}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <Star className="size-4 fill-primary text-primary" />
          {provider.ratingAvg.toFixed(1)}
        </div>
      </div>

      {provider.offerings.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {provider.offerings.slice(0, 3).map((offering) => (
            <Badge key={offering.id}>{pickLocalized(offering.serviceCatalogItem.name, locale)}</Badge>
          ))}
          {provider.offerings.length > 3 && <Badge variant="default">+{provider.offerings.length - 3}</Badge>}
        </div>
      )}

      {provider.brands.length > 0 && (
        <p className="truncate text-sm text-muted-foreground">{provider.brands.map((brand) => brand.name).join(', ')}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <a href={`tel:${provider.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Phone className="size-3.5" />
          {provider.phone}
        </a>
        <Link href={{ pathname: '/services/[id]', params: { id: provider.id } }}>
          <Button size="sm" variant="outline">
            {t('viewProfile')}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
