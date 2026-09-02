import { setRequestLocale } from 'next-intl/server';
import { AdminPaymentsView } from '@/components/admin/payments/AdminPaymentsView';

export default async function AdminPaymentsPage({ params }: PageProps<'/[locale]/admin/payments'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminPaymentsView />;
}
