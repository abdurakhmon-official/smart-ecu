'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { BrandOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { useBrands } from '@/hooks/use-vehicle-catalog';
import { useUpdateMyTuner } from '@/hooks/use-my-tuner';

// interfaces

interface TunerBrandsPanelProps {
  selected: BrandOutput[];
}

export function TunerBrandsPanel({ selected }: TunerBrandsPanelProps) {
  const t = useTranslations('myTuner');
  const { data: brands } = useBrands();
  const update = useUpdateMyTuner();

  const [brandIds, setBrandIds] = useState<string[]>(selected.map((brand) => brand.id));

  const toggle = (brandId: string) => {
    setBrandIds((current) => (current.includes(brandId) ? current.filter((id) => id !== brandId) : [...current, brandId]));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t('selectBrands')}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {brands?.map((brand) => (
          <label key={brand.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={brandIds.includes(brand.id)}
              onChange={() => toggle(brand.id)}
            />
            {brand.name}
          </label>
        ))}
      </div>

      <Button className="self-start" disabled={update.isPending} onClick={() => update.mutate({ brandIds })}>
        {update.isPending ? t('saving') : t('save')}
      </Button>
    </div>
  );
}
