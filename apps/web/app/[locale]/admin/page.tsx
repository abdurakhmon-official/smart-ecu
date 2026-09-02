import { setRequestLocale } from 'next-intl/server';
import { AdminStatsView } from '@/components/admin/stats/AdminStatsView';

export default async function AdminPage({ params }: PageProps<'/[locale]/admin'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminStatsView />;
}
