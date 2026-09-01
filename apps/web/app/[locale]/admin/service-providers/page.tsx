import { setRequestLocale } from 'next-intl/server';
import { AdminServiceProvidersView } from '@/components/admin/service-providers/AdminServiceProvidersView';

export default async function AdminServiceProvidersPage({ params }: PageProps<'/[locale]/admin/service-providers'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminServiceProvidersView />;
}
