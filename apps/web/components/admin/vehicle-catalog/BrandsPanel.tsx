'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useBrands, useCreateBrand, useDeleteBrand } from '@/hooks/use-vehicle-catalog';

export function BrandsPanel() {
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
          createBrand.mutate({ name: name.trim() }, { onSuccess: () => setName('') });
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
