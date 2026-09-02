'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { useVehicleHealthScore } from '@/hooks/use-vehicle-health';

// interfaces

interface VehicleHealthBadgeProps {
  vehicleId: string;
}

export function VehicleHealthBadge({ vehicleId }: VehicleHealthBadgeProps) {
  const t = useTranslations('myGarage.health');
  const { data } = useVehicleHealthScore(vehicleId);

  if (!data) return null;

  const variant = data.score >= 70 ? 'success' : data.score >= 40 ? 'warning' : 'danger';

  return (
    <Badge variant={variant} title={t('title')}>
      {t('score', { score: data.score })}
    </Badge>
  );
}
