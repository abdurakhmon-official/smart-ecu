'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { FuelType, TransmissionType } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  useBrands,
  useCreateBrand,
  useCreateEngineOption,
  useCreateGeneration,
  useCreateModel,
  useDeleteBrand,
  useDeleteEngineOption,
  useDeleteGeneration,
  useDeleteModel,
  useEngineOptions,
  useGenerations,
  useModels,
} from '@/hooks/use-vehicle-catalog';

const FUEL_TYPES: FuelType[] = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG'];
const TRANSMISSION_TYPES: TransmissionType[] = ['MANUAL', 'AUTOMATIC', 'CVT', 'ROBOT'];

export function AdminVehicleCatalogView() {
  const t = useTranslations('admin.vehicleCatalog');
  const [brandId, setBrandId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const [generationId, setGenerationId] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Tabs defaultValue="brands">
        <TabsList>
          <TabsTrigger value="brands">{t('tabs.brands')}</TabsTrigger>
          <TabsTrigger value="models">{t('tabs.models')}</TabsTrigger>
          <TabsTrigger value="generations">{t('tabs.generations')}</TabsTrigger>
          <TabsTrigger value="engines">{t('tabs.engines')}</TabsTrigger>
        </TabsList>

        <TabsContent value="brands">
          <BrandsPanel />
        </TabsContent>

        <TabsContent value="models">
          <BrandSelector value={brandId} onChange={setBrandId} />
          {brandId ? <ModelsPanel brandId={brandId} /> : <EmptyHint text={t('selectBrandFirst')} />}
        </TabsContent>

        <TabsContent value="generations">
          <BrandSelector value={brandId} onChange={(id) => { setBrandId(id); setModelId(undefined); }} />
          {brandId && <ModelSelector brandId={brandId} value={modelId} onChange={setModelId} />}
          {modelId ? <GenerationsPanel modelId={modelId} /> : <EmptyHint text={t('selectModelFirst')} />}
        </TabsContent>

        <TabsContent value="engines">
          <BrandSelector value={brandId} onChange={(id) => { setBrandId(id); setModelId(undefined); setGenerationId(undefined); }} />
          {brandId && (
            <ModelSelector
              brandId={brandId}
              value={modelId}
              onChange={(id) => { setModelId(id); setGenerationId(undefined); }}
            />
          )}
          {modelId && <GenerationSelector modelId={modelId} value={generationId} onChange={setGenerationId} />}
          {generationId ? <EnginesPanel generationId={generationId} /> : <EmptyHint text={t('selectGenerationFirst')} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── shared selectors ─────────────────────────────────────────────────────

function EmptyHint({ text }: { text: string }) {
  return <p className="mt-4 text-sm text-muted-foreground">{text}</p>;
}

function BrandSelector({ value, onChange }: { value: string | undefined; onChange: (id: string | undefined) => void }) {
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

function ModelSelector({
  brandId,
  value,
  onChange,
}: {
  brandId: string;
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
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

function GenerationSelector({
  modelId,
  value,
  onChange,
}: {
  modelId: string;
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
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

// ── Brands ───────────────────────────────────────────────────────────────

function BrandsPanel() {
  const t = useTranslations('admin.vehicleCatalog');
  const { data: brands } = useBrands();
  const createBrand = useCreateBrand();
  const deleteBrand = useDeleteBrand();
  const [name, setName] = useState('');

  return (
    <div className="mt-4 flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          createBrand.mutate(
            { name: name.trim() },
            { onSuccess: () => setName('') },
          );
        }}
      >
        <Input placeholder={t('name')} value={name} onChange={(event) => setName(event.target.value)} className="max-w-xs" />
        <Button type="submit" disabled={createBrand.isPending}>
          {t('add')}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!brands?.length && (
            <TableRow>
              <TableCell colSpan={2} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {brands?.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>{brand.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => window.confirm(t('deleteConfirm')) && deleteBrand.mutate(brand.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Models ───────────────────────────────────────────────────────────────

function ModelsPanel({ brandId }: { brandId: string }) {
  const t = useTranslations('admin.vehicleCatalog');
  const { data: models } = useModels(brandId);
  const createModel = useCreateModel();
  const deleteModel = useDeleteModel();
  const [name, setName] = useState('');

  return (
    <div className="mt-4 flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          createModel.mutate({ brandId, name: name.trim() }, { onSuccess: () => setName('') });
        }}
      >
        <Input placeholder={t('name')} value={name} onChange={(event) => setName(event.target.value)} className="max-w-xs" />
        <Button type="submit" disabled={createModel.isPending}>
          {t('add')}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!models?.length && (
            <TableRow>
              <TableCell colSpan={2} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {models?.map((model) => (
            <TableRow key={model.id}>
              <TableCell>{model.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => window.confirm(t('deleteConfirm')) && deleteModel.mutate(model.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Generations ──────────────────────────────────────────────────────────

function GenerationsPanel({ modelId }: { modelId: string }) {
  const t = useTranslations('admin.vehicleCatalog');
  const { data: generations } = useGenerations(modelId);
  const createGeneration = useCreateGeneration();
  const deleteGeneration = useDeleteGeneration();
  const [name, setName] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  return (
    <div className="mt-4 flex flex-col gap-4">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || !yearFrom) return;
          createGeneration.mutate(
            { modelId, name: name.trim(), yearFrom: Number(yearFrom), yearTo: yearTo ? Number(yearTo) : undefined },
            { onSuccess: () => { setName(''); setYearFrom(''); setYearTo(''); } },
          );
        }}
      >
        <FormField label={t('name')} htmlFor="gen-name">
          <Input id="gen-name" value={name} onChange={(event) => setName(event.target.value)} className="w-32" />
        </FormField>
        <FormField label={t('yearFrom')} htmlFor="gen-year-from">
          <Input id="gen-year-from" type="number" value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} className="w-28" />
        </FormField>
        <FormField label={t('yearTo')} htmlFor="gen-year-to">
          <Input id="gen-year-to" type="number" value={yearTo} onChange={(event) => setYearTo(event.target.value)} className="w-28" />
        </FormField>
        <Button type="submit" disabled={createGeneration.isPending}>
          {t('add')}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('yearFrom')}</TableHead>
            <TableHead>{t('yearTo')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!generations?.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {generations?.map((generation) => (
            <TableRow key={generation.id}>
              <TableCell>{generation.name}</TableCell>
              <TableCell>{generation.yearFrom}</TableCell>
              <TableCell>{generation.yearTo ?? '—'}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => window.confirm(t('deleteConfirm')) && deleteGeneration.mutate(generation.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Engine options ───────────────────────────────────────────────────────

function EnginesPanel({ generationId }: { generationId: string }) {
  const t = useTranslations('admin.vehicleCatalog');
  const tFuel = useTranslations('fuelType');
  const tTransmission = useTranslations('transmissionType');
  const { data: engines } = useEngineOptions(generationId);
  const createEngine = useCreateEngineOption();
  const deleteEngine = useDeleteEngineOption();

  const [name, setName] = useState('');
  const [volumeLiters, setVolumeLiters] = useState('');
  const [powerHp, setPowerHp] = useState('');
  const [fuel, setFuel] = useState<FuelType>('PETROL');
  const [transmission, setTransmission] = useState<TransmissionType>('AUTOMATIC');

  return (
    <div className="mt-4 flex flex-col gap-4">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          createEngine.mutate(
            {
              generationId,
              name: name.trim(),
              volumeLiters: volumeLiters ? Number(volumeLiters) : undefined,
              powerHp: powerHp ? Number(powerHp) : undefined,
              fuel,
              transmission,
            },
            { onSuccess: () => { setName(''); setVolumeLiters(''); setPowerHp(''); } },
          );
        }}
      >
        <FormField label={t('name')} htmlFor="engine-name">
          <Input id="engine-name" value={name} onChange={(event) => setName(event.target.value)} className="w-32" />
        </FormField>
        <FormField label={t('volumeLiters')} htmlFor="engine-volume">
          <Input id="engine-volume" type="number" step="0.1" value={volumeLiters} onChange={(event) => setVolumeLiters(event.target.value)} className="w-24" />
        </FormField>
        <FormField label={t('powerHp')} htmlFor="engine-power">
          <Input id="engine-power" type="number" value={powerHp} onChange={(event) => setPowerHp(event.target.value)} className="w-24" />
        </FormField>
        <FormField label={t('fuel')} htmlFor="engine-fuel">
          <Select id="engine-fuel" value={fuel} onChange={(event) => setFuel(event.target.value as FuelType)} className="w-32">
            {FUEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {tFuel(type)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('transmission')} htmlFor="engine-transmission">
          <Select
            id="engine-transmission"
            value={transmission}
            onChange={(event) => setTransmission(event.target.value as TransmissionType)}
            className="w-32"
          >
            {TRANSMISSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {tTransmission(type)}
              </option>
            ))}
          </Select>
        </FormField>
        <Button type="submit" disabled={createEngine.isPending}>
          {t('add')}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('fuel')}</TableHead>
            <TableHead>{t('transmission')}</TableHead>
            <TableHead>{t('powerHp')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!engines?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {engines?.map((engine) => (
            <TableRow key={engine.id}>
              <TableCell>{engine.name}</TableCell>
              <TableCell>{tFuel(engine.fuel)}</TableCell>
              <TableCell>{tTransmission(engine.transmission)}</TableCell>
              <TableCell>{engine.powerHp ?? '—'}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => window.confirm(t('deleteConfirm')) && deleteEngine.mutate(engine.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
