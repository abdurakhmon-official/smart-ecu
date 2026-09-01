'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { VehiclePicker, type VehiclePickerValue } from '@/components/vehicle/VehiclePicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { useCreateVehicle } from '@/hooks/use-my-garage';
import { Link } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';

export function HeroVehiclePicker() {
  const t = useTranslations('vehiclePicker');
  const { isAuthenticated } = useSession();
  const createVehicle = useCreateVehicle();

  const [value, setValue] = useState<VehiclePickerValue>({});
  const [saved, setSaved] = useState(false);

  const canSave = Boolean(value.engineOptionId);

  const onSave = async () => {
    if (!value.engineOptionId) return;

    try {
      await createVehicle.mutateAsync({ engineOptionId: value.engineOptionId });
      toast.success(t('saved'));
      setSaved(true);
    } catch (error) {
      toast.error(errorFrom(error).message);
    }
  };

  return (
    <Card className="w-full max-w-4xl p-5 text-left">
      <p className="mb-3 font-semibold">{t('title')}</p>
      <VehiclePicker value={value} onChange={setValue} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {isAuthenticated ? (
          <Button disabled={!canSave || createVehicle.isPending} onClick={onSave}>
            {createVehicle.isPending ? '…' : t('save')}
          </Button>
        ) : (
          <Link href="/sign-up">
            <Button disabled={!canSave}>{t('save')}</Button>
          </Link>
        )}

        {saved && (
          <Link href="/my-garage">
            <Button variant="outline">{t('goToGarage')}</Button>
          </Link>
        )}
      </div>

      {!isAuthenticated && canSave && <p className="mt-2 text-sm text-muted-foreground">{t('signInToSave')}</p>}
    </Card>
  );
}
