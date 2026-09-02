'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { useAuditLog } from '@/hooks/use-audit-log';

export function AdminAuditLogView() {
  const t = useTranslations('admin.auditLog');
  const [page, setPage] = useState(1);
  const { data } = useAuditLog({ page });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((entry) => (
            <Card key={entry.id} className="flex flex-col gap-1 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-medium">{entry.action}</span>
                <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-muted-foreground">
                {t('by')} {entry.actorFullName} ({entry.actorEmail}) · {entry.targetType}
                {entry.targetId ? ` #${entry.targetId.slice(0, 8)}` : ''}
              </p>
            </Card>
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}
