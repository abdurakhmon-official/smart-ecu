import { setRequestLocale } from 'next-intl/server';
import { AdminVehicleCatalogView } from '@/components/admin/vehicle-catalog/AdminVehicleCatalogView';

export default async function AdminVehicleCatalogPage({ params }: PageProps<'/[locale]/admin/vehicle-catalog'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminVehicleCatalogView />;
}
