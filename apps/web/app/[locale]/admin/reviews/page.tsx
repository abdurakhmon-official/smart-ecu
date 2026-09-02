import { setRequestLocale } from 'next-intl/server';
import { AdminReviewsView } from '@/components/admin/reviews/AdminReviewsView';

export default async function AdminReviewsPage({ params }: PageProps<'/[locale]/admin/reviews'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminReviewsView />;
}
