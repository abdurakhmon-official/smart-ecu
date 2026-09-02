'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { PaymentStatus } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useAdminPayments } from '@/hooks/use-admin-payments';

const STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'CANCELLED', 'FAILED'];
const STATUS_BADGE_VARIANT = { PENDING: 'warning', PAID: 'success', CANCELLED: 'default', FAILED: 'danger' } as const;

export function AdminPaymentsView() {
  const t = useTranslations('admin.payments');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const { data } = useAdminPayments({ status: status || undefined });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Select value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus | '')} className="max-w-48">
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
            <TableHead>{t('plan')}</TableHead>
            <TableHead>{t('provider')}</TableHead>
            <TableHead>{t('amount')}</TableHead>
            <TableHead>{t('statusLabel')}</TableHead>
            <TableHead>{t('date')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data?.data.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.plan}</TableCell>
              <TableCell>{payment.provider}</TableCell>
              <TableCell>{payment.amount.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[payment.status]}>{t(`status.${payment.status}`)}</Badge>
              </TableCell>
              <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
