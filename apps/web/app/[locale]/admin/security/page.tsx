import { setRequestLocale } from 'next-intl/server';
import { AdminSecurityView } from '@/components/admin/security/AdminSecurityView';

export default async function AdminSecurityPage({ params }: PageProps<'/[locale]/admin/security'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminSecurityView />;
}
