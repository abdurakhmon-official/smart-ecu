import { setRequestLocale } from 'next-intl/server';
import { MyOrdersView } from '@/components/orders/MyOrdersView';

export default async function MyOrdersPage({ params }: PageProps<'/[locale]/my-orders'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MyOrdersView />;
}
