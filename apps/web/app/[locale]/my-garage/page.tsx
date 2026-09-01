import { setRequestLocale } from 'next-intl/server';
import { MyGarageView } from '@/components/my-garage/MyGarageView';

export default async function MyGaragePage({ params }: PageProps<'/[locale]/my-garage'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MyGarageView />;
}
