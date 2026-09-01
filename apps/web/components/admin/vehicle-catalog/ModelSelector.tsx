'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import { useModels } from '@/hooks/use-vehicle-catalog';

// interfaces

interface ModelSelectorProps {
  brandId: string;
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}

export function ModelSelector({ brandId, value, onChange }: ModelSelectorProps) {
  const t = useTranslations('admin.vehicleCatalog');
  const { data: models } = useModels(brandId);

  return (
    <Select className="mt-3 max-w-xs" value={value ?? ''} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="">{t('selectModel')}</option>
      {models?.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </Select>
  );
}
