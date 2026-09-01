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
import { useCreateEngineOption, useDeleteEngineOption, useEngineOptions } from '@/hooks/use-vehicle-catalog';

const FUEL_TYPES: FuelType[] = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG'];
const TRANSMISSION_TYPES: TransmissionType[] = ['MANUAL', 'AUTOMATIC', 'CVT', 'ROBOT'];

// interfaces

interface EnginesPanelProps {
  generationId: string;
}

export function EnginesPanel({ generationId }: EnginesPanelProps) {
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
            {
              onSuccess: () => {
                setName('');
                setVolumeLiters('');
                setPowerHp('');
              },
            },
          );
        }}
      >
        <FormField label={t('name')} htmlFor="engine-name">
          <Input id="engine-name" value={name} onChange={(event) => setName(event.target.value)} className="w-32" />
        </FormField>
        <FormField label={t('volumeLiters')} htmlFor="engine-volume">
          <Input
            id="engine-volume"
            type="number"
            step="0.1"
            value={volumeLiters}
            onChange={(event) => setVolumeLiters(event.target.value)}
            className="w-24"
          />
        </FormField>
        <FormField label={t('powerHp')} htmlFor="engine-power">
          <Input
            id="engine-power"
            type="number"
            value={powerHp}
            onChange={(event) => setPowerHp(event.target.value)}
            className="w-24"
          />
        </FormField>
        <FormField label={t('fuel')} htmlFor="engine-fuel">
          {/* `<option value>` ro'yxati pastda `FUEL_TYPES`dan generatsiya qilinadi, shuning uchun qiymat doim shu union'ga mos. */}
          <Select id="engine-fuel" value={fuel} onChange={(event) => setFuel(event.target.value as FuelType)} className="w-32">
            {FUEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {tFuel(type)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('transmission')} htmlFor="engine-transmission">
          {/* `<option value>` ro'yxati pastda `TRANSMISSION_TYPES`dan generatsiya qilinadi, shuning uchun qiymat doim shu union'ga mos. */}
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
