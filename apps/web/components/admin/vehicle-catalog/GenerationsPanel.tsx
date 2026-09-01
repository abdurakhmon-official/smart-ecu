'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useCreateGeneration, useDeleteGeneration, useGenerations } from '@/hooks/use-vehicle-catalog';

// interfaces

interface GenerationsPanelProps {
  modelId: string;
}

export function GenerationsPanel({ modelId }: GenerationsPanelProps) {
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
            {
              onSuccess: () => {
                setName('');
                setYearFrom('');
                setYearTo('');
              },
            },
          );
        }}
      >
        <FormField label={t('name')} htmlFor="gen-name">
          <Input id="gen-name" value={name} onChange={(event) => setName(event.target.value)} className="w-32" />
        </FormField>
        <FormField label={t('yearFrom')} htmlFor="gen-year-from">
          <Input
            id="gen-year-from"
            type="number"
            value={yearFrom}
            onChange={(event) => setYearFrom(event.target.value)}
            className="w-28"
          />
        </FormField>
        <FormField label={t('yearTo')} htmlFor="gen-year-to">
          <Input
            id="gen-year-to"
            type="number"
            value={yearTo}
            onChange={(event) => setYearTo(event.target.value)}
            className="w-28"
          />
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
