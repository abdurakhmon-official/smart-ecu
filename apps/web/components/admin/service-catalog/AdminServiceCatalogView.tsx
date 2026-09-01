'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CreateServiceCatalogItemInputSchema, type CreateServiceCatalogItemInput } from '@repo/contracts';
import { LocalizedFields } from '@/components/admin/LocalizedFields';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useDeleteServiceCatalogItem, useCreateServiceCatalogItem, useServiceCatalog } from '@/hooks/use-service-catalog';
import { errorFrom } from '@/lib/errors';
import { pickLocalized } from '@/lib/localized';

export function AdminServiceCatalogView() {
  const t = useTranslations('admin.serviceCatalog');
  const locale = useAppLocale();
  const { data: items } = useServiceCatalog();
  const createItem = useCreateServiceCatalogItem();
  const deleteItem = useDeleteServiceCatalogItem();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateServiceCatalogItemInput>({ resolver: zodResolver(CreateServiceCatalogItemInputSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createItem.mutateAsync(data);
      reset();
    } catch (error) {
      setError('root', { message: errorFrom(error).message });
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <FormField label={t('slug')} htmlFor="slug" error={errors.slug?.message}>
          <Input id="slug" placeholder="ecu-diagnostics" {...register('slug')} className="max-w-xs" />
        </FormField>
        <LocalizedFields name="name" label={t('name')} register={register} />
        <LocalizedFields name="description" label={t('description')} register={register} multiline />
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" disabled={createItem.isPending} className="self-start">
          {t('add')}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('slug')}</TableHead>
            <TableHead>{t('name')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!items?.length && (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
          {items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-sm">{item.slug}</TableCell>
              <TableCell>{pickLocalized(item.name, locale)}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => window.confirm(t('deleteConfirm')) && deleteItem.mutate(item.id)}
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
