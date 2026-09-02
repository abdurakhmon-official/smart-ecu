import { setRequestLocale } from 'next-intl/server';
import { AdminOrdersView } from '@/components/admin/orders/AdminOrdersView';

export default async function AdminOrdersPage({ params }: PageProps<'/[locale]/admin/orders'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminOrdersView />;
}
