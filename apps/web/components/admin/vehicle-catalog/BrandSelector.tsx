'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import { useBrands } from '@/hooks/use-vehicle-catalog';

// interfaces

interface BrandSelectorProps {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}

export function BrandSelector({ value, onChange }: BrandSelectorProps) {
  const t = useTranslations('admin.vehicleCatalog');
  const { data: brands } = useBrands();

  return (
    <Select className="mt-4 max-w-xs" value={value ?? ''} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="">{t('selectBrand')}</option>
      {brands?.map((brand) => (
        <option key={brand.id} value={brand.id}>
          {brand.name}
        </option>
      ))}
    </Select>
  );
}
