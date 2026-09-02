'use client';

import { Download, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { TuningOrderOutput, TuningOrderStatus } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useSetTuningResults, useUpdateTuningOrderStatus, useUploadTunerEcuFile } from '@/hooks/use-tuner-orders';
import { useUpload } from '@/hooks/use-upload';
import { pickLocalized } from '@/lib/localized';

const STATUSES: TuningOrderStatus[] = ['NEW', 'IN_PROGRESS', 'WAITING_FOR_LOG', 'READY', 'COMPLETED', 'CANCELLED'];
const STATUS_BADGE_VARIANT = {
  NEW: 'default',
  IN_PROGRESS: 'warning',
  WAITING_FOR_LOG: 'warning',
  READY: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
} as const;

// interfaces

interface TuningOrderCardProps {
  order: TuningOrderOutput;
}

export function TuningOrderCard({ order }: TuningOrderCardProps) {
  const t = useTranslations('myTuner.orders');
  const locale = useAppLocale();
  const updateStatus = useUpdateTuningOrderStatus();
  const setResults = useSetTuningResults();
  const uploadEcuFile = useUploadTunerEcuFile();
  const upload = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [results, setResultsState] = useState({
    powerAfterHp: order.powerAfterHp?.toString() ?? '',
    torqueAfterNm: order.torqueAfterNm?.toString() ?? '',
    fuelConsumptionAfter: order.fuelConsumptionAfter?.toString() ?? '',
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const { key, fileName } = await upload.mutateAsync({ folder: 'ecu-file', file });
    await uploadEcuFile.mutateAsync({
      id: order.id,
      input: { kind: 'MODIFIED', storageKey: key, originalName: fileName },
    });
  };

  const saveResults = () => {
    setResults.mutate({
      id: order.id,
      input: {
        powerAfterHp: results.powerAfterHp ? Number(results.powerAfterHp) : undefined,
        torqueAfterNm: results.torqueAfterNm ? Number(results.torqueAfterNm) : undefined,
        fuelConsumptionAfter: results.fuelConsumptionAfter ? Number(results.fuelConsumptionAfter) : undefined,
      },
    });
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{pickLocalized(order.serviceCatalogItem.name, locale)}</p>
          <p className="text-sm text-muted-foreground">{order.customerName}</p>
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{t(`status.${order.status}`)}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{order.problemDescription}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={order.status}
          onChange={(event) => updateStatus.mutate({ id: order.id, input: { status: event.target.value as TuningOrderStatus } })}
          disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
          className="max-w-48"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`status.${status}`)}
            </option>
          ))}
        </Select>

        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending || uploadEcuFile.isPending}>
          <Upload className="size-3.5" />
          {t('uploadFile')}
        </Button>
      </div>

      {order.files.length > 0 && (
        <div className="flex flex-col gap-1">
          {order.files.map((file) => (
            <a
              key={file.id}
              href={`${process.env.NEXT_PUBLIC_API_URL}/s3/file/${file.storageKey}?attachment=true&fileName=${encodeURIComponent(file.originalName)}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Download className="size-3.5" />
              {t(`fileKind.${file.kind}`)}: {file.originalName}
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t('powerAfterHp')}
          <Input
            type="number"
            className="w-24"
            value={results.powerAfterHp}
            onChange={(event) => setResultsState((prev) => ({ ...prev, powerAfterHp: event.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t('torqueAfterNm')}
          <Input
            type="number"
            className="w-24"
            value={results.torqueAfterNm}
            onChange={(event) => setResultsState((prev) => ({ ...prev, torqueAfterNm: event.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t('fuelConsumptionAfter')}
          <Input
            type="number"
            className="w-24"
            value={results.fuelConsumptionAfter}
            onChange={(event) => setResultsState((prev) => ({ ...prev, fuelConsumptionAfter: event.target.value }))}
          />
        </label>
        <Button size="sm" onClick={saveResults} disabled={setResults.isPending}>
          {t('saveResults')}
        </Button>
        {order.resultsVerified && <Badge variant="success">{t('verified')}</Badge>}
      </div>
    </Card>
  );
}
