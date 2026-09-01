'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ServiceOfferingOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useServiceCatalog } from '@/hooks/use-service-catalog';
import { useAddMyOffering, useRemoveMyOffering } from '@/hooks/use-my-service';
import { pickLocalized } from '@/lib/localized';

// interfaces

interface OfferingsPanelProps {
  offerings: ServiceOfferingOutput[];
}

export function OfferingsPanel({ offerings }: OfferingsPanelProps) {
  const t = useTranslations('myService');
  const locale = useAppLocale();
  const { data: catalog } = useServiceCatalog();
  const addOffering = useAddMyOffering();
  const removeOffering = useRemoveMyOffering();

  const [serviceCatalogItemId, setServiceCatalogItemId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const availableItems = catalog?.filter((item) => !offerings.some((offering) => offering.serviceCatalogItemId === item.id));

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!serviceCatalogItemId) return;
          addOffering.mutate(
            {
              serviceCatalogItemId,
              priceMin: priceMin ? Number(priceMin) : undefined,
              priceMax: priceMax ? Number(priceMax) : undefined,
            },
            {
              onSuccess: () => {
                setServiceCatalogItemId('');
                setPriceMin('');
                setPriceMax('');
              },
            },
          );
        }}
      >
        <FormField label={t('addOffering')} htmlFor="offering-item">
          <Select id="offering-item" value={serviceCatalogItemId} onChange={(event) => setServiceCatalogItemId(event.target.value)} className="w-56">
            <option value="">{t('selectService')}</option>
            {availableItems?.map((item) => (
              <option key={item.id} value={item.id}>
                {pickLocalized(item.name, locale)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('priceMin')} htmlFor="offering-price-min">
          <Input id="offering-price-min" type="number" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} className="w-32" />
        </FormField>
        <FormField label={t('priceMax')} htmlFor="offering-price-max">
          <Input id="offering-price-max" type="number" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} className="w-32" />
        </FormField>
        <Button type="submit" disabled={!serviceCatalogItemId || addOffering.isPending}>
          {t('add')}
        </Button>
      </form>

      {!offerings.length ? (
        <p className="text-sm text-muted-foreground">{t('noOfferings')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {offerings.map((offering) => (
            <div key={offering.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
              <div>
                <p className="font-medium">{pickLocalized(offering.serviceCatalogItem.name, locale)}</p>
                {(offering.priceMin || offering.priceMax) && (
                  <p className="text-sm text-muted-foreground">
                    {offering.priceMin ?? 0}–{offering.priceMax ?? '∞'}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => removeOffering.mutate(offering.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
