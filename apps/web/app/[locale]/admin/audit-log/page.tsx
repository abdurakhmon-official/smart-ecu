import { setRequestLocale } from 'next-intl/server';
import { AdminAuditLogView } from '@/components/admin/audit-log/AdminAuditLogView';

export default async function AdminAuditLogPage({ params }: PageProps<'/[locale]/admin/audit-log'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminAuditLogView />;
}
