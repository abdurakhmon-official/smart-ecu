import { setRequestLocale } from 'next-intl/server';
import { AdminTunersView } from '@/components/admin/tuners/AdminTunersView';

export default async function AdminTunersPage({ params }: PageProps<'/[locale]/admin/tuners'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminTunersView />;
}
