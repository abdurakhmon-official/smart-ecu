'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ServiceStatus } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useAdminServiceProviders, useSuspendServiceProvider, useVerifyServiceProvider } from '@/hooks/use-service-providers';

const STATUS_BADGE_VARIANT = { PENDING: 'warning', VERIFIED: 'success', SUSPENDED: 'danger' } as const;
const STATUSES: ServiceStatus[] = ['PENDING', 'VERIFIED', 'SUSPENDED'];

export function AdminServiceProvidersView() {
  const t = useTranslations('admin.serviceProviders');
  const [status, setStatus] = useState<ServiceStatus | ''>('');
  const { data } = useAdminServiceProviders({ status: status || undefined });
  const verify = useVerifyServiceProvider();
  const suspend = useSuspendServiceProvider();

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
          {data?.data.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell>{provider.name}</TableCell>
              <TableCell>{provider.city}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[provider.status]}>{t(`status.${provider.status}`)}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {provider.status !== 'VERIFIED' && (
                  <Button size="sm" onClick={() => verify.mutate(provider.id)} disabled={verify.isPending}>
                    {t('verify')}
                  </Button>
                )}
                {provider.status !== 'SUSPENDED' && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => suspend.mutate(provider.id)} disabled={suspend.isPending}>
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
