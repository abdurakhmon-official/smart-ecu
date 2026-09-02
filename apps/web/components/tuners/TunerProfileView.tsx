'use client';

import { Clock, MapPin, MessageCircle, Phone, Send, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CreateTuningOrderDialog } from '@/components/tuners/CreateTuningOrderDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTuner } from '@/hooks/use-tuners';
import { Link } from '@/i18n/navigation';

// interfaces

interface TunerProfileViewProps {
  id: string;
}

export function TunerProfileView({ id }: TunerProfileViewProps) {
  const t = useTranslations('tunerProfile');
  const tTuningOrders = useTranslations('tuningOrders');
  const { data: tuner, isPending } = useTuner(id);

  if (isPending || !tuner) {
    return <div className="mx-auto w-full max-w-3xl px-4 py-12" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <Link href="/tuners" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t('back')}
      </Link>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{tuner.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {tuner.city}
              {tuner.address && ` · ${tuner.address}`}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-lg font-semibold">
            <Star className="size-5 fill-primary text-primary" />
            {tuner.ratingAvg.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">({tuner.ratingCount})</span>
          </div>
        </div>

        {tuner.description && <p className="text-sm text-muted-foreground">{tuner.description}</p>}

        {tuner.workingHours && (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            {tuner.workingHours}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <a href={`tel:${tuner.phone}`}>
            <Button size="sm">
              <Phone className="size-4" />
              {t('call')}
            </Button>
          </a>
          {tuner.telegram && (
            <a href={`https://t.me/${tuner.telegram.replace(/^@/, '')}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <Send className="size-4" />
                Telegram
              </Button>
            </a>
          )}
          {tuner.whatsapp && (
            <a href={`https://wa.me/${tuner.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </a>
          )}
          <CreateTuningOrderDialog
            tunerId={tuner.id}
            trigger={
              <Button size="sm" variant="outline">
                {tTuningOrders('createTitle')}
              </Button>
            }
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="font-semibold">{t('brands')}</h2>
        {!tuner.brands.length ? (
          <p className="text-sm text-muted-foreground">{t('noBrands')}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tuner.brands.map((brand) => (
              <Badge key={brand.id}>{brand.name}</Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
