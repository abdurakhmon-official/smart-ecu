'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { BroadcastNotificationInputSchema, type BroadcastRole } from '@repo/contracts';
import { LocalizedFields } from '@/components/admin/LocalizedFields';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useBroadcastNotification } from '@/hooks/use-notifications';
import { errorFrom } from '@/lib/errors';

const ROLES: BroadcastRole[] = ['ALL', 'CUSTOMER', 'SERVICE', 'TUNER'];

/** `role`da `.default('ALL')` bor — forma to'ldirilmasdan oldingi shakl uni ixtiyoriy deb biladi. */
type BroadcastFormValues = z.input<typeof BroadcastNotificationInputSchema>;

export function AdminNotificationsView() {
  const t = useTranslations('admin.notifications');
  const broadcast = useBroadcastNotification();
  const [sentCount, setSentCount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(BroadcastNotificationInputSchema),
    defaultValues: { role: 'ALL' },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSentCount(null);
    const role = data.role ?? 'ALL';

    try {
      const result = await broadcast.mutateAsync({ ...data, role });
      setSentCount(result.recipientCount);
      reset({ message: { uz: '', ru: '', en: '' }, role });
    } catch (error) {
      setError('root', { message: errorFrom(error).message });
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-4 rounded-lg border border-border p-4">
        <LocalizedFields name="message" label={t('message')} register={register} multiline />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('audience')}</span>
          <Select {...register('role')} className="max-w-48">
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`role.${role}`)}
              </option>
            ))}
          </Select>
        </div>

        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        {sentCount !== null && <p className="text-sm text-emerald-600 dark:text-emerald-400">{t('sent', { count: sentCount })}</p>}

        <Button type="submit" disabled={broadcast.isPending} className="self-start">
          {broadcast.isPending ? t('sending') : t('send')}
        </Button>
      </form>
    </div>
  );
}
