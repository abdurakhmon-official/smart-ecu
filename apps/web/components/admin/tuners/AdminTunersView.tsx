'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ServiceStatus } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useAdminTuners, useSuspendTuner, useVerifyTuner } from '@/hooks/use-tuners';

const STATUS_BADGE_VARIANT = { PENDING: 'warning', VERIFIED: 'success', SUSPENDED: 'danger' } as const;
const STATUSES: ServiceStatus[] = ['PENDING', 'VERIFIED', 'SUSPENDED'];

export function AdminTunersView() {
  const t = useTranslations('admin.tuners');
  const [status, setStatus] = useState<ServiceStatus | ''>('');
  const { data } = useAdminTuners({ status: status || undefined });
  const verify = useVerifyTuner();
  const suspend = useSuspendTuner();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Select value={status} onChange={(event) => setStatus(event.target.value as ServiceStatus | '')} className="max-w-48">
        <option value="">{t('allStatuses')}</option>
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {t(`status.${value}`)}
          </option>
        ))}
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('city')}</TableHead>
            <TableHead>{t('statusLabel')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data?.data.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((tuner) => (
            <TableRow key={tuner.id}>
              <TableCell>{tuner.name}</TableCell>
              <TableCell>{tuner.city}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[tuner.status]}>{t(`status.${tuner.status}`)}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {tuner.status !== 'VERIFIED' && (
                  <Button size="sm" onClick={() => verify.mutate(tuner.id)} disabled={verify.isPending}>
                    {t('verify')}
                  </Button>
                )}
                {tuner.status !== 'SUSPENDED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => suspend.mutate(tuner.id)}
                    disabled={suspend.isPending}
                  >
                    {t('suspend')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
