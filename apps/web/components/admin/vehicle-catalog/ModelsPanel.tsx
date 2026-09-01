'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useCreateModel, useDeleteModel, useModels } from '@/hooks/use-vehicle-catalog';

// interfaces

interface ModelsPanelProps {
  brandId: string;
}

export function ModelsPanel({ brandId }: ModelsPanelProps) {
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
