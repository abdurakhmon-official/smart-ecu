'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CreateServiceProviderInputSchema, type CreateServiceProviderInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useApplyAsService } from '@/hooks/use-my-service';
import { errorFrom } from '@/lib/errors';

export function ApplyForm() {
  const t = useTranslations('myService');
  const apply = useApplyAsService();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateServiceProviderInput>({ resolver: zodResolver(CreateServiceProviderInputSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await apply.mutateAsync(data);
    } catch (error) {
      setError('root', { message: errorFrom(error).message });
    }
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>{t('applyTitle')}</CardTitle>
        <CardDescription>{t('applyDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
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
              <Input id="phone" {...register('phone')} placeholder="+998901234567" />
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
            <Input id="workingHours" {...register('workingHours')} placeholder="09:00–18:00" />
          </FormField>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={apply.isPending} className="mt-2">
            {apply.isPending ? t('applying') : t('apply')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
