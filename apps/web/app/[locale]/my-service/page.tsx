import { setRequestLocale } from 'next-intl/server';
import { MyServiceView } from '@/components/my-service/MyServiceView';

export default async function MyServicePage({ params }: PageProps<'/[locale]/my-service'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MyServiceView />;
}
