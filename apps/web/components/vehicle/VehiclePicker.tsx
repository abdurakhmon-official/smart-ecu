'use client';

import { useTranslations } from 'next-intl';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { useBrands, useEngineOptions, useGenerations, useModels } from '@/hooks/use-vehicle-catalog';

// interfaces

export interface VehiclePickerValue {
  brandId?: string;
  modelId?: string;
  generationId?: string;
  engineOptionId?: string;
}

interface VehiclePickerProps {
  value: VehiclePickerValue;
  onChange: (value: VehiclePickerValue) => void;
  className?: string;
}

export function VehiclePicker({ value, onChange, className }: VehiclePickerProps) {
  const t = useTranslations('vehiclePicker');
  const tFuel = useTranslations('fuelType');
  const tTransmission = useTranslations('transmissionType');

  const { data: brands, isPending: brandsPending } = useBrands();
  const { data: models, isPending: modelsPending } = useModels(value.brandId);
  const { data: generations, isPending: generationsPending } = useGenerations(value.modelId);
  const { data: engines, isPending: enginesPending } = useEngineOptions(value.generationId);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label={t('brand')} htmlFor="vehicle-brand">
          <Select
            id="vehicle-brand"
            value={value.brandId ?? ''}
            disabled={brandsPending}
            onChange={(event) => onChange({ brandId: event.target.value || undefined })}
          >
            <option value="">{t('selectBrand')}</option>
            {brands?.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={t('model')} htmlFor="vehicle-model">
          <Select
            id="vehicle-model"
            value={value.modelId ?? ''}
            disabled={!value.brandId || modelsPending}
            onChange={(event) => onChange({ ...value, modelId: event.target.value || undefined, generationId: undefined, engineOptionId: undefined })}
          >
            <option value="">{t('selectModel')}</option>
            {models?.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={t('generation')} htmlFor="vehicle-generation">
          <Select
            id="vehicle-generation"
            value={value.generationId ?? ''}
            disabled={!value.modelId || generationsPending}
            onChange={(event) => onChange({ ...value, generationId: event.target.value || undefined, engineOptionId: undefined })}
          >
            <option value="">{t('selectGeneration')}</option>
            {generations?.map((generation) => (
              <option key={generation.id} value={generation.id}>
                {generation.name} ({generation.yearFrom}
                {generation.yearTo ? `–${generation.yearTo}` : '+'})
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={t('engine')} htmlFor="vehicle-engine">
          <Select
            id="vehicle-engine"
            value={value.engineOptionId ?? ''}
            disabled={!value.generationId || enginesPending}
            onChange={(event) => onChange({ ...value, engineOptionId: event.target.value || undefined })}
          >
            <option value="">{t('selectEngine')}</option>
            {engines?.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.name} · {tFuel(engine.fuel)} · {tTransmission(engine.transmission)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </div>
  );
}
