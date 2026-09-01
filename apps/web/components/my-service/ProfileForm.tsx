'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { UpdateServiceProviderInputSchema, type ServiceProviderOutput, type UpdateServiceProviderInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUpdateMyService } from '@/hooks/use-my-service';
import { errorFrom } from '@/lib/errors';

// interfaces

interface ProfileFormProps {
  provider: ServiceProviderOutput;
}

export function ProfileForm({ provider }: ProfileFormProps) {
  const t = useTranslations('myService');
  const update = useUpdateMyService();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateServiceProviderInput>({
    resolver: zodResolver(UpdateServiceProviderInputSchema),
    defaultValues: {
      name: provider.name,
      description: provider.description ?? undefined,
      city: provider.city,
      address: provider.address ?? undefined,
      phone: provider.phone,
      telegram: provider.telegram ?? undefined,
      whatsapp: provider.whatsapp ?? undefined,
      instagram: provider.instagram ?? undefined,
      workingHours: provider.workingHours ?? undefined,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await update.mutateAsync(data);
    } catch (error) {
      setError('root', { message: errorFrom(error).message });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label={t('name')} htmlFor="name" error={errors.name?.message}>
        <Input id="name" {...register('name')} />
      </FormField>
      <FormField label={t('description')} htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" {...register('description')} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('city')} htmlFor="city" error={errors.city?.message}>
          <Input id="city" {...register('city')} />
        </FormField>
        <FormField label={t('phone')} htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register('phone')} />
        </FormField>
      </div>
      <FormField label={t('address')} htmlFor="address" error={errors.address?.message}>
        <Input id="address" {...register('address')} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label={t('telegram')} htmlFor="telegram" error={errors.telegram?.message}>
          <Input id="telegram" {...register('telegram')} />
        </FormField>
        <FormField label={t('whatsapp')} htmlFor="whatsapp" error={errors.whatsapp?.message}>
          <Input id="whatsapp" {...register('whatsapp')} />
        </FormField>
        <FormField label={t('instagram')} htmlFor="instagram" error={errors.instagram?.message}>
          <Input id="instagram" {...register('instagram')} />
        </FormField>
      </div>
      <FormField label={t('workingHours')} htmlFor="workingHours" error={errors.workingHours?.message}>
        <Input id="workingHours" {...register('workingHours')} />
      </FormField>

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <Button type="submit" disabled={update.isPending} className="mt-2 self-start">
        {update.isPending ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
