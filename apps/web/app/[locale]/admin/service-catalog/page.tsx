import { setRequestLocale } from 'next-intl/server';
import { AdminServiceCatalogView } from '@/components/admin/service-catalog/AdminServiceCatalogView';

export default async function AdminServiceCatalogPage({ params }: PageProps<'/[locale]/admin/service-catalog'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminServiceCatalogView />;
}
