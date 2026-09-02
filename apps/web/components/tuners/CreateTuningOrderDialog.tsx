'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CreateTuningOrderInputSchema, type CreateTuningOrderInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useSession } from '@/hooks/use-auth';
import { useMyVehicles } from '@/hooks/use-my-garage';
import { useCreateTuningOrder } from '@/hooks/use-my-tuning-orders';
import { useServiceCatalog } from '@/hooks/use-service-catalog';
import { errorFrom } from '@/lib/errors';
import { Link } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/localized';

// interfaces

interface CreateTuningOrderDialogProps {
  tunerId: string;
  trigger: React.ReactNode;
}

export function CreateTuningOrderDialog({ tunerId, trigger }: CreateTuningOrderDialogProps) {
  const t = useTranslations('tuningOrders');
  const locale = useAppLocale();
  const { isAuthenticated } = useSession();
  const { data: vehicles } = useMyVehicles(isAuthenticated);
  const { data: catalog } = useServiceCatalog();
  const createOrder = useCreateTuningOrder();

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTuningOrderInput>({
    resolver: zodResolver(CreateTuningOrderInputSchema),
    defaultValues: { tunerId },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createOrder.mutateAsync({ ...data, tunerId });
      setOpen(false);
      reset({ tunerId });
    } catch (error) {
      setError('root', { message: errorFrom(error).message });
    }
  });

  if (!isAuthenticated) {
    return (
      <Link href="/sign-in">
        <Button>{t('signInToOrder')}</Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('createTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {Boolean(vehicles?.length) && (
            <FormField label={t('vehicle')} htmlFor="tuning-order-vehicle">
              <Select id="tuning-order-vehicle" {...register('userVehicleId')}>
                <option value="">{t('noVehicle')}</option>
                {vehicles?.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.engineOption
                      ? `${vehicle.engineOption.generation.model.brand.name} ${vehicle.engineOption.generation.model.name}`
                      : `${vehicle.customBrand} ${vehicle.customModel}`}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label={t('serviceType')} htmlFor="tuning-order-service" error={errors.serviceCatalogItemId?.message}>
            <Select id="tuning-order-service" {...register('serviceCatalogItemId')}>
              <option value="">{t('selectService')}</option>
              {catalog?.map((item) => (
                <option key={item.id} value={item.id}>
                  {pickLocalized(item.name, locale)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t('problemDescription')} htmlFor="tuning-order-problem" error={errors.problemDescription?.message}>
            <Textarea id="tuning-order-problem" {...register('problemDescription')} />
          </FormField>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? t('sending') : t('send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
