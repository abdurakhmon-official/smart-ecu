'use client';

import { MapPin, Phone, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TunerProfileOutput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';

// interfaces

interface TunerCardProps {
  tuner: TunerProfileOutput;
}

export function TunerCard({ tuner }: TunerCardProps) {
  const t = useTranslations('tuners');

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{tuner.name}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{tuner.city}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <Star className="size-4 fill-primary text-primary" />
          {tuner.ratingAvg.toFixed(1)}
        </div>
      </div>

      {tuner.brands.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tuner.brands.slice(0, 4).map((brand) => (
            <Badge key={brand.id}>{brand.name}</Badge>
          ))}
          {tuner.brands.length > 4 && <Badge variant="default">+{tuner.brands.length - 4}</Badge>}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <a href={`tel:${tuner.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Phone className="size-3.5" />
          {tuner.phone}
        </a>
        <Link href={{ pathname: '/tuners/[id]', params: { id: tuner.id } }}>
          <Button size="sm" variant="outline">
            {t('viewProfile')}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
