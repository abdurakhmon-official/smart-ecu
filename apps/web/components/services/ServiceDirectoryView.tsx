'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { ServiceProviderCard } from '@/components/services/ServiceProviderCard';
import { useBrands } from '@/hooks/use-vehicle-catalog';
import { useServiceCatalog } from '@/hooks/use-service-catalog';
import { useServiceProviders } from '@/hooks/use-service-providers';
import { useAppLocale } from '@/hooks/use-app-locale';
import { pickLocalized } from '@/lib/localized';

export function ServiceDirectoryView() {
  const t = useTranslations('services');
  const locale = useAppLocale();

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [brandId, setBrandId] = useState('');
  const [serviceCatalogItemId, setServiceCatalogItemId] = useState('');
  const [page, setPage] = useState(1);

  const { data: brands } = useBrands();
  const { data: serviceCatalog } = useServiceCatalog();
  const { data } = useServiceProviders({
    search: search || undefined,
    city: city || undefined,
    brandId: brandId || undefined,
    serviceCatalogItemId: serviceCatalogItemId || undefined,
    page,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

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
        <Select
          value={serviceCatalogItemId}
          onChange={(event) => {
            setServiceCatalogItemId(event.target.value);
            setPage(1);
          }}
          className="max-w-56"
        >
          <option value="">{t('allServices')}</option>
          {serviceCatalog?.map((item) => (
            <option key={item.id} value={item.id}>
              {pickLocalized(item.name, locale)}
            </option>
          ))}
        </Select>
      </div>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((provider) => (
            <ServiceProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}
