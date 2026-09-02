import { setRequestLocale } from 'next-intl/server';
import { TunerDirectoryView } from '@/components/tuners/TunerDirectoryView';

export default async function TunersPage({ params }: PageProps<'/[locale]/tuners'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TunerDirectoryView />;
}
