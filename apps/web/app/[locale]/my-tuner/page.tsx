import { setRequestLocale } from 'next-intl/server';
import { MyTunerView } from '@/components/my-tuner/MyTunerView';

export default async function MyTunerPage({ params }: PageProps<'/[locale]/my-tuner'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MyTunerView />;
}
