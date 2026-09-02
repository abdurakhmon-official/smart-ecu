import { setRequestLocale } from 'next-intl/server';
import { AdminNotificationsView } from '@/components/admin/notifications/AdminNotificationsView';

export default async function AdminNotificationsPage({ params }: PageProps<'/[locale]/admin/notifications'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminNotificationsView />;
}
