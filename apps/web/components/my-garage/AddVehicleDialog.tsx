'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { VehiclePicker, type VehiclePickerValue } from '@/components/vehicle/VehiclePicker';
import { useCreateVehicle } from '@/hooks/use-my-garage';
import { errorFrom } from '@/lib/errors';

const EMPTY_PICKER: VehiclePickerValue = {};

interface AddVehicleDialogProps {
  trigger: React.ReactNode;
}

export function AddVehicleDialog({ trigger }: AddVehicleDialogProps) {
  const t = useTranslations('myGarage');
  const tPicker = useTranslations('vehiclePicker');
  const createVehicle = useCreateVehicle();

  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [picker, setPicker] = useState<VehiclePickerValue>(EMPTY_PICKER);
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [vin, setVin] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [mileageKm, setMileageKm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCustom(false);
    setPicker(EMPTY_PICKER);
    setCustomBrand('');
    setCustomModel('');
    setCustomYear('');
    setVin('');
    setPlateNumber('');
    setMileageKm('');
    setError(null);
  };

  const canSubmit = custom ? Boolean(customBrand && customModel) : Boolean(picker.engineOptionId);

  const onSubmit = async () => {
    setError(null);

    try {
      await createVehicle.mutateAsync({
        engineOptionId: custom ? undefined : picker.engineOptionId,
        customBrand: custom ? customBrand : undefined,
        customModel: custom ? customModel : undefined,
        customYear: custom && customYear ? Number(customYear) : undefined,
        vin: vin || undefined,
        plateNumber: plateNumber || undefined,
        mileageKm: mileageKm ? Number(mileageKm) : undefined,
      });

      toast.success(tPicker('saved'));
      setOpen(false);
      reset();
    } catch (submitError) {
      setError(errorFrom(submitError).message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('addVehicle')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Switch id="custom-vehicle" checked={custom} onChange={setCustom} label={t('addCustom')} />

          {custom ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label={t('customBrand')} htmlFor="custom-brand">
                <Input id="custom-brand" value={customBrand} onChange={(event) => setCustomBrand(event.target.value)} />
              </FormField>
              <FormField label={t('customModel')} htmlFor="custom-model">
                <Input id="custom-model" value={customModel} onChange={(event) => setCustomModel(event.target.value)} />
              </FormField>
              <FormField label={t('customYear')} htmlFor="custom-year">
                <Input
                  id="custom-year"
                  type="number"
                  value={customYear}
                  onChange={(event) => setCustomYear(event.target.value)}
                />
              </FormField>
            </div>
          ) : (
            <VehiclePicker value={picker} onChange={setPicker} />
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label={t('vin')} htmlFor="vehicle-vin">
              <Input id="vehicle-vin" value={vin} onChange={(event) => setVin(event.target.value)} />
            </FormField>
            <FormField label={t('plateNumber')} htmlFor="vehicle-plate">
              <Input id="vehicle-plate" value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} />
            </FormField>
            <FormField label={t('mileageKm')} htmlFor="vehicle-mileage">
              <Input
                id="vehicle-mileage"
                type="number"
                value={mileageKm}
                onChange={(event) => setMileageKm(event.target.value)}
              />
            </FormField>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit || createVehicle.isPending}>
            {createVehicle.isPending ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
