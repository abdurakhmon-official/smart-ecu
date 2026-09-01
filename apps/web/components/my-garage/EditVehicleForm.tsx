'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { UserVehicleOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { DialogFooter } from '@/components/ui/Dialog';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useUpdateVehicle } from '@/hooks/use-my-garage';
import { errorFrom } from '@/lib/errors';

// interfaces

interface EditVehicleFormProps {
  vehicle: UserVehicleOutput;
  onClose: () => void;
}

export function EditVehicleForm({ vehicle, onClose }: EditVehicleFormProps) {
  const t = useTranslations('myGarage');
  const updateVehicle = useUpdateVehicle();

  const [vin, setVin] = useState(vehicle.vin ?? '');
  const [plateNumber, setPlateNumber] = useState(vehicle.plateNumber ?? '');
  const [mileageKm, setMileageKm] = useState(vehicle.mileageKm ? String(vehicle.mileageKm) : '');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    try {
      await updateVehicle.mutateAsync({
        vehicleId: vehicle.id,
        input: {
          vin: vin || undefined,
          plateNumber: plateNumber || undefined,
          mileageKm: mileageKm ? Number(mileageKm) : undefined,
        },
      });
      onClose();
    } catch (submitError) {
      setError(errorFrom(submitError).message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <FormField label={t('vin')} htmlFor="edit-vin">
          <Input id="edit-vin" value={vin} onChange={(event) => setVin(event.target.value)} />
        </FormField>
        <FormField label={t('plateNumber')} htmlFor="edit-plate">
          <Input id="edit-plate" value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} />
        </FormField>
        <FormField label={t('mileageKm')} htmlFor="edit-mileage">
          <Input id="edit-mileage" type="number" value={mileageKm} onChange={(event) => setMileageKm(event.target.value)} />
        </FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button onClick={onSubmit} disabled={updateVehicle.isPending}>
          {updateVehicle.isPending ? t('saving') : t('save')}
        </Button>
      </DialogFooter>
    </>
  );
}
