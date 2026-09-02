'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { TunerCard } from '@/components/tuners/TunerCard';
import { useBrands } from '@/hooks/use-vehicle-catalog';
import { useTuners } from '@/hooks/use-tuners';

export function TunerDirectoryView() {
  const t = useTranslations('tuners');

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);

  const { data: brands } = useBrands();
  const { data } = useTuners({ search: search || undefined, city: city || undefined, brandId: brandId || undefined, page });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder={t('filterCity')}
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setPage(1);
          }}
          className="max-w-40"
        />
        <Select
          value={brandId}
          onChange={(event) => {
            setBrandId(event.target.value);
            setPage(1);
          }}
          className="max-w-48"
        >
          <option value="">{t('allBrands')}</option>
          {brands?.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Select>
      </div>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((tuner) => (
            <TunerCard key={tuner.id} tuner={tuner} />
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}
