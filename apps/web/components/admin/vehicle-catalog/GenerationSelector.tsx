'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import { useGenerations } from '@/hooks/use-vehicle-catalog';

// interfaces

interface GenerationSelectorProps {
  modelId: string;
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}

export function GenerationSelector({ modelId, value, onChange }: GenerationSelectorProps) {
  const t = useTranslations('admin.vehicleCatalog');
  const { data: generations } = useGenerations(modelId);

  return (
    <Select className="mt-3 max-w-xs" value={value ?? ''} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="">{t('selectGeneration')}</option>
      {generations?.map((generation) => (
        <option key={generation.id} value={generation.id}>
          {generation.name} ({generation.yearFrom}
          {generation.yearTo ? `–${generation.yearTo}` : '+'})
        </option>
      ))}
    </Select>
  );
}
