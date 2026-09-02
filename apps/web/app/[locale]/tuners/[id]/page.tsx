import { setRequestLocale } from 'next-intl/server';
import { TunerProfileView } from '@/components/tuners/TunerProfileView';

export default async function TunerProfilePage({ params }: PageProps<'/[locale]/tuners/[id]'>) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <TunerProfileView id={id} />;
}
